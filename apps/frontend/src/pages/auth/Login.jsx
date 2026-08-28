import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ROLE_HOME } from '../../routes/roleHome'

// Único correo autorizado fuera del dominio institucional.
const ADMIN_EMAIL = 'admin@ludebra.test'
const INSTITUTIONAL_DOMAIN = '@unicesar.edu.co'

// Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número.
const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

function isAllowedEmail(email) {
  const normalized = email.trim().toLowerCase()
  return normalized === ADMIN_EMAIL || normalized.endsWith(INSTITUTIONAL_DOMAIN)
}

function isAdminEmail(email) {
  return email.trim().toLowerCase() === ADMIN_EMAIL
}

export function Login() {
  const { login, logout, isAuthenticated, role, profile, error: authError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  // Solo redirigimos automáticamente si veníamos de una ruta protegida
  // (ProtectedRoute) o si el usuario acaba de hacer login desde este
  // formulario. Si solo hay una sesión persistida (p. ej. la de admin),
  // mostramos el panel para cambiar de cuenta en vez de redirigir ciego.
  const [redirectIntent, setRedirectIntent] = useState(() => Boolean(location.state?.from))

  useEffect(() => {
    if (redirectIntent && isAuthenticated && role) {
      const redirectTo = location.state?.from?.pathname ?? ROLE_HOME[role]
      navigate(redirectTo, { replace: true })
    }
  }, [redirectIntent, isAuthenticated, role, navigate, location.state])

  const showAccountPanel = isAuthenticated && profile && !redirectIntent

  async function handleUseAnotherAccount() {
    setRedirectIntent(false)
    await logout()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    if (!email || !password) {
      setFormError('Todos los campos son obligatorios.')
      return
    }

    if (!isAllowedEmail(email)) {
      setFormError('Solo se permiten correos institucionales (@unicesar.edu.co).')
      return
    }

    if (!isAdminEmail(email) && !PASSWORD_POLICY.test(password)) {
      setFormError(
        'La contraseña debe tener mínimo 8 caracteres, incluyendo una mayúscula, una minúscula y un número.'
      )
      return
    }

    setSubmitting(true)
    try {
      await login(email, password)
      setRedirectIntent(true)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-slate-900 px-4 py-12">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500 shadow-lg shadow-sky-500/30">
          <FlaskIcon className="h-8 w-8 text-slate-900" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">LUDEBRA LABS</h1>
        <p className="text-slate-400">Virtual Laboratory Environment</p>
      </div>

      <div className="rounded-2xl border-t-4 border-sky-400 bg-slate-50 p-6 shadow-2xl sm:p-8" style={{ width: '100%', maxWidth: '28rem' }}>
        {showAccountPanel ? (
          <>
            <h2 className="text-2xl font-semibold text-slate-900">Sesión activa</h2>
            <p className="mt-2 text-sm text-slate-600">
              Ya hay una sesión iniciada. Continúa o usa otra cuenta.
            </p>

            <div className="mt-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold uppercase text-sky-700">
                {(profile.displayName || profile.firstName || '?').slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {profile.displayName || `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim()}
                </p>
                <p className="truncate text-xs text-slate-500">{profile.email}</p>
                <p className="mt-0.5 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                  {role}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(location.state?.from?.pathname ?? ROLE_HOME[role], { replace: true })}
              className="mt-6 w-full rounded-lg bg-sky-700 py-3 font-semibold text-white transition hover:bg-sky-800"
            >
              Continuar a la plataforma
            </button>
            <button
              onClick={handleUseAnotherAccount}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Usar otra cuenta
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-slate-900">Autenticación</h2>
            <p className="mt-2 text-sm text-slate-600">
              Ingrese sus credenciales institucionales para acceder al entorno simulado.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Correo institucional
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="usuario@unicesar.edu.co"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  style={{ width: '100%' }}
                />
                <p className="mt-1 text-xs text-slate-400">
                  Solo correos institucionales @unicesar.edu.co
                </p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-10 text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    style={{ width: '100%' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Mínimo 8 caracteres, con una mayúscula, una minúscula y un número.
                </p>
              </div>

              {(formError || authError) && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {formError || authError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 rounded-lg bg-sky-700 py-3 font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ width: '100%' }}
              >
                {submitting ? 'Ingresando...' : 'Ingresar al Laboratorio'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

function FlaskIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M9 3h6M10 3v6.5L4.8 18a2 2 0 0 0 1.7 3h11a2 2 0 0 0 1.7-3L14 9.5V3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
