import axios from 'axios'
import { auth } from './firebase'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Antes de cada request, si hay sesión de Firebase activa, se pide un
// idToken (fresco, Firebase lo cachea y solo lo renueva si está por
// expirar) y se manda como Bearer token. El backend lo verifica con
// firebase-admin y busca el perfil real en su propia BD.
apiClient.interceptors.request.use(async (config) => {
  const currentUser = auth.currentUser
  if (currentUser) {
    const idToken = await currentUser.getIdToken()
    config.headers.Authorization = `Bearer ${idToken}`
    console.log('idToken:', idToken)
  }
  return config
})

export default apiClient
