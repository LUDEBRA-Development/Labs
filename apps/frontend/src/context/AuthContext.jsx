import { useEffect, useState, useCallback } from 'react'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import { apiClient } from '../lib/apiClient'
import { AuthContext } from './authContextValue'

export function AuthProvider({ children }) {
  // firebaseUser = identidad ("quién entra"), viene de Firebase.
  // profile = perfil académico ("quién es", nombre + rol), viene de tu API.
  const [firebaseUser, setFirebaseUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadProfile = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/users/me')
      console.log(data)
      setProfile(data)
      return data
    } catch (err) {
      // El token de Firebase es válido, pero el backend rechazó al usuario
      // (no existe en la BD propia, o fue desactivado por un admin).
      // No dejamos una sesión "a medias": cerramos también en Firebase.
      console.log('Error al cargar perfil:', err)
      await signOut(auth)
      setProfile(null)
      throw err
    }
  }, [])

  // Se dispara al cargar la app y cada vez que cambia la sesión de Firebase
  // (login, logout, o el token cacheado del navegador al recargar la página).
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user)
      setError(null)

      if (user) {
        try {
          await loadProfile()
        } catch {
          setError('Tu cuenta no tiene acceso al sistema. Contacta al administrador.')
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [loadProfile])

  const login = useCallback(async (email, password) => {
    setError(null)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      // El profile se carga automáticamente en el listener de arriba.
    } catch (err) {
      const message = mapFirebaseError(err.code)
      setError(message)
      throw new Error(message, { cause: err })
    }
  }, [])

  const logout = useCallback(async () => {
    await signOut(auth)
  }, [])

  const value = {
    firebaseUser,
    profile,
    role: profile?.role ?? null,
    isAuthenticated: Boolean(firebaseUser && profile),
    loading,
    error,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}



function mapFirebaseError(code) {
  switch (code) {
    case 'auth/invalid-email':
      return 'El correo no tiene un formato válido.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Correo o contraseña incorrectos.'
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Intenta de nuevo más tarde.'
    case 'auth/user-disabled':
      return 'Esta cuenta está deshabilitada.'
    default:
      return 'No se pudo iniciar sesión. Intenta de nuevo.'
  }
}
