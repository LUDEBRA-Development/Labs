import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function AdminDashboard() {
  const { profile } = useAuth()

  const sections = [
    {
      title: 'Usuarios',
      description: 'Registra docentes y estudiantes, controla acceso al sistema',
      icon: 'group',
      to: '/admin/usuarios',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Cursos',
      description: 'Crea y gestiona cursos de laboratorio virtual',
      icon: 'school',
      to: '/admin/cursos',
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Simuladores',
      description: 'Administra simuladores disponibles para las actividades',
      icon: 'science',
      to: '/admin/simuladores',
      color: 'from-purple-500 to-purple-600',
    },
  ]

  return (
    <div className='space-y-8'>
      {/* Bienvenida */}
      <div>
        <h1 className='text-3xl font-bold text-slate-900'>
          Bienvenido, {profile?.firstName}
        </h1>
        <p className='mt-2 text-slate-600'>
          Panel de administración de LUDEBRA Labs
        </p>
      </div>

      {/* Grid de secciones */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {sections.map((section) => (
          <Link
            key={section.to}
            to={section.to}
            className={`bg-gradient-to-br ${section.color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}
          >
            <div className='flex items-start justify-between mb-4'>
              <div className='flex-1'>
                <h2 className='text-xl font-bold'>{section.title}</h2>
                <p className='text-sm mt-1 opacity-90'>{section.description}</p>
              </div>
              <span className='material-symbols-outlined text-4xl opacity-20 ml-2'>
                {section.icon}
              </span>
            </div>
            <div className='mt-4 inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-medium'>
              Ir a {section.title}
              <span className='material-symbols-outlined text-lg'>arrow_forward</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Información rápida */}
      <div className='bg-slate-50 border border-slate-200 rounded-xl p-6'>
        <h3 className='text-lg font-semibold text-slate-900 mb-4'>Información rápida</h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='text-center'>
            <div className='text-3xl font-bold text-blue-600'>-</div>
            <p className='text-sm text-slate-600 mt-1'>Usuarios Registrados</p>
          </div>
          <div className='text-center'>
            <div className='text-3xl font-bold text-green-600'>-</div>
            <p className='text-sm text-slate-600 mt-1'>Cursos Activos</p>
          </div>
          <div className='text-center'>
            <div className='text-3xl font-bold text-purple-600'>-</div>
            <p className='text-sm text-slate-600 mt-1'>Simuladores</p>
          </div>
        </div>
      </div>
    </div>
  )
}

