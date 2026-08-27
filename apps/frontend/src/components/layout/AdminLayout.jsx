import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Sidebar from './Sidebar'

export function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { profile } = useAuth()

  return (
    <div className='flex h-screen overflow-hidden bg-surface-bright'>
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/40 md:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-[260px] transition-transform duration-200 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar
          user={{
            name: profile ? `${profile.firstName} ${profile.lastName}` : 'Usuario',
            role: 'System Controller',
          }}
          onNavigate={() => setSidebarOpen(false)}
        />
      </div>

      <main className='flex-1 md:ml-[260px] h-full overflow-y-auto'>
        <div className='flex items-center border-b border-slate-200 bg-white px-4 py-3 md:hidden sticky top-0 z-30'>
          <button
            onClick={() => setSidebarOpen(true)}
            className='p-2 -ml-2 rounded-lg hover:bg-slate-100'
            aria-label='Abrir menú'
          >
            <svg className='h-6 w-6 text-slate-700' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M4 6h16M4 12h16M4 18h16' />
            </svg>
          </button>
          <span className='ml-3 font-bold text-slate-800'>LUDEBRA LABS</span>
        </div>
        <div className='p-4 md:p-8'>
          {children || <Outlet />}
        </div>
      </main>
    </div>
  )
}
