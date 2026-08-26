import { NavLink } from 'react-router-dom'
import Logo from './Logo'
import Avatar from '../ui/Avatar'
import Icon from '../ui/Icon'

const navLinks = [
  { to: '/campus/cursos', label: 'Mis Cursos' },
  { to: '/campus/calificaciones', label: 'Calificaciones' },
  { to: '/campus/simuladores', label: 'Simuladores' },
]

export default function Navbar({
  user = { name: 'Docente', role: 'Docente' },
  showSearch = false,
}) {
  return (
    <nav className="bg-surface border-b border-outline-variant shadow-sm sticky top-0 z-50">
      <div className="flex justify-between items-center w-full h-16 px-6 max-w-full mx-auto">
        <div className="flex items-center gap-8">
          <Logo variant="dark" size="sm" />
          <div className="hidden md:flex items-center gap-6 h-16">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `h-full flex items-center transition-all duration-200 ${
                    isActive
                      ? 'text-secondary border-b-2 border-secondary font-bold'
                      : 'text-on-surface-variant hover:text-primary'
                  } text-body-md font-body-md`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {showSearch && (
            <div className="hidden md:flex items-center bg-surface-container-low rounded-full px-4 py-2 border border-outline-variant">
              <Icon name="search" className="text-outline mr-2 text-[20px]" />
              <input
                type="text"
                placeholder="Buscar..."
                className="bg-transparent border-none focus:ring-0 text-body-md font-body-md p-0 w-48 text-on-surface placeholder:text-on-surface-variant"
              />
            </div>
          )}
          <button className="text-on-surface-variant hover:text-primary p-2 rounded-full hover:bg-surface-container-low transition-colors">
            <Icon name="notifications" />
          </button>
          <Avatar name={user.name} size="sm" bg="primary" />
        </div>
      </div>
    </nav>
  )
}
