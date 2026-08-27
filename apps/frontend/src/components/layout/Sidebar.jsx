import { NavLink } from 'react-router-dom'
import Logo from './Logo'

const navItems = [
  { to: '/admin', icon: 'dashboard', label: 'Dashboard' },
  { to: '/admin/usuarios', icon: 'group', label: 'Usuarios' },
  { to: '/admin/cursos', icon: 'school', label: 'Cursos' },
  { to: '/admin/simuladores', icon: 'science', label: 'Simuladores' },
]

export default function Sidebar({ user = { name: 'Admin', role: 'System Controller' }, onNavigate }) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <nav className="fixed left-0 top-0 h-full flex flex-col bg-primary shadow-xl z-50 w-[260px]">
      <div className="p-4 border-b border-primary-container/30">
        <Logo variant="light" size="md" />
      </div>

      <div className="flex items-center gap-3 px-4 py-4 mb-2">
        <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-label-md font-bold text-sm">
          {initials}
        </div>
        <div>
          <p className="font-label-md text-label-md text-on-primary font-bold leading-tight">
            {user.name}
          </p>
          <p className="font-body-sm text-body-sm text-on-primary-fixed-variant">
            {user.role}
          </p>
        </div>
      </div>

      <div className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg font-label-sm text-label-sm transition-all duration-200 ${
                isActive
                  ? 'bg-secondary-container text-on-secondary-container font-bold scale-95'
                  : 'text-on-primary-container opacity-70 hover:opacity-100 hover:bg-primary-container'
              }`
            }
          >
            <span className="material-symbols-outlined text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-primary-container/30">
        <NavLink
          to="/admin/nuevo-usuario"
          className="w-full bg-secondary hover:bg-opacity-90 text-on-secondary font-label-sm text-label-sm py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md"
        >
          <span className="material-symbols-outlined text-lg">person_add</span>
          Nuevo Usuario
        </NavLink>
      </div>
    </nav>
  )
}
