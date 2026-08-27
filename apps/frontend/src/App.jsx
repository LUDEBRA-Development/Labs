import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { CursosList, CourseFormPage } from './modules/cursos'
import Sidebar from './components/layout/Sidebar'
import { CrearActividadPage } from './modules/actividades'
import { useAuth } from './hooks/useAuth'
import { ProtectedRoute, FullScreenSpinner } from './routes/ProtectedRoute'
import { RoleRoute } from './routes/RoleRoute'
import { ROLE_HOME } from './routes/roleHome'
import { AppLayout } from './components/layout/AppLayout'
import { Login } from './pages/auth/Login'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { UsersManagement } from './pages/admin/UsersManagement'
import { TeacherDashboard } from './pages/teacher/TeacherDashboard'
import { StudentSubjects } from './pages/student/StudentSubjects'
import { NotFound } from './pages/NotFound'
import StudentTaskDetailPage from './modules/actividades/pages/StudentTaskDetailPage'
import { StudentEvaluationPage } from './modules/evaluation/StudentEvaluationPage'
import { TeacherEvaluationPage } from './modules/evaluation/TeacherEvaluationPage'

function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className='flex h-screen overflow-hidden bg-surface-bright'>
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/40 md:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-[260px] transition-transform duration-200 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
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
          {children}
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <Routes>
      {/* ============================================================
          RUTAS PÚBLICAS
      ============================================================ */}
      <Route path='/login' element={<Login />} />

      {/* ============================================================
          REDIRECCIÓN INICIAL (según rol)
      ============================================================ */}
      <Route path='/' element={<RootRedirect />} />

      {/* ============================================================
          RUTAS AUTENTICADAS — AppLayout común
      ============================================================ */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>

          {/* --- Administrador --- */}
          <Route element={<RoleRoute allow={['admin']} />}>
            <Route path='/admin' element={<AdminDashboard />} />
            <Route path='/admin/usuarios' element={<UsersManagement />} />
          </Route>

          {/* --- Docente --- */}
          <Route element={<RoleRoute allow={['teacher']} />}>
            <Route path='/docente' element={<TeacherDashboard />} />
          </Route>

          {/* --- Estudiante --- */}
          <Route element={<RoleRoute allow={['student']} />}>
            <Route path='/materias' element={<StudentSubjects />} />
          </Route>

          {/* --- Evaluación: Estudiante --- */}
          <Route element={<RoleRoute allow={['student']} />}>
            <Route path='/evaluacion' element={<StudentEvaluationPage />} />
          </Route>

          {/* --- Evaluación: Docente --- */}
          <Route element={<RoleRoute allow={['teacher']} />}>
            <Route path='/evaluacion/docente/*' element={<TeacherEvaluationPage />} />
          </Route>

        </Route>
      </Route>

      {/* ============================================================
          ADMIN — Cursos y Actividades (AdminLayout con Sidebar)
      ============================================================ */}
      <Route
        path='/admin/cursos'
        element={
          <AdminLayout>
            <CursosList />
          </AdminLayout>
        }
      />
      <Route
        path='/admin/cursos/nuevo'
        element={
          <AdminLayout>
            <CourseFormPage />
          </AdminLayout>
        }
      />
      <Route
        path='/admin/cursos/:id/editar'
        element={
          <AdminLayout>
            <CourseFormPage />
          </AdminLayout>
        }
      />
      <Route
        path='/admin/cursos/:cursoId/actividades/nueva'
        element={
          <AdminLayout>
            <CrearActividadPage />
          </AdminLayout>
        }
      />

      {/* ============================================================
          ESTUDIANTE — Detalle de actividad
      ============================================================ */}
      <Route
        path='/estudiante/cursos/:cursoId/actividades/:idTask'
        element={
          <AdminLayout>
            <StudentTaskDetailPage />
          </AdminLayout>
        }
      />

      {/* ============================================================
          CATCH-ALL
      ============================================================ */}
      <Route path='*' element={<Navigate to='/admin/cursos' replace />} />
    </Routes>
  )
}

function RootRedirect() {
  const { isAuthenticated, role, loading } = useAuth()

  if (loading) return <FullScreenSpinner />
  if (!isAuthenticated) return <Navigate to='/login' replace />
  return <Navigate to={ROLE_HOME[role] ?? '/login'} replace />
}

export default App
