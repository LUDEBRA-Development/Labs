import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const ROLE_LABEL = {
  admin: 'Administrador',
  teacher: 'Docente',
  student: 'Estudiante',
}

export function AppLayout() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 shadow-sm">
        <span className="font-bold tracking-tight text-slate-800">LUDEBRA LABS</span>
        <div className="flex items-center gap-4">
          {profile && (
            <span className="text-sm text-slate-600">
              {profile.firstName} {profile.lastName}{' '}
              <span className="ml-1 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700">
                {ROLE_LABEL[profile.role] ?? profile.role}
              </span>
            </span>
          )}
          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cerrar sesión
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
