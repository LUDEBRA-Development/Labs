import { Outlet, useNavigate, NavLink } from 'react-router-dom'
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
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-6">
        <span className="font-bold tracking-tight text-slate-800">LUDEBRA LABS</span>
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <nav className="flex items-center">
            <NavLink
              to="/campus/simuladores"
              className={({ isActive }) =>
                `shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-sky-100 text-sky-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              Simuladores
            </NavLink>
          </nav>
          {profile && (
            <span className="text-sm text-slate-600 truncate">
              <span className="hidden sm:inline">{profile.firstName} {profile.lastName} </span>
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700">
                {ROLE_LABEL[profile.role] ?? profile.role}
              </span>
            </span>
          )}
          <button
            onClick={handleLogout}
            className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cerrar sesión
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
