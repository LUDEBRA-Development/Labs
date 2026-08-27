import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ROLE_HOME } from '../../routes/roleHome'

export function Login() {
  const { login, isAuthenticated, role, error: authError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Una vez que hay sesión + perfil cargado, redirige: o a donde intentaba
  // entrar antes de que lo mandaran al login, o al home de su rol.
  useEffect(() => {
    if (isAuthenticated && role) {
      const redirectTo = location.state?.from?.pathname ?? ROLE_HOME[role]
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, role, navigate, location.state])

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    if (!email || !password) {
      setFormError('Todos los campos son obligatorios.')
      return
    }

    setSubmitting(true)
    try {
      await login(email, password)
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
              placeholder="usuario@universidad.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              style={{ width: '100%' }}
            />
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
