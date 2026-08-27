import { Routes, Route, Navigate } from 'react-router-dom'
import { CursosList, CourseFormPage } from './cursos'
import Sidebar from './components/layout/Sidebar'
import { CrearActividadPage } from './actividades'
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
import StudentTaskDetailPage from './actividades/pages/StudentTaskDetailPage'

function AdminLayout({ children }) {
  return (
    <div className='flex h-screen overflow-hidden bg-surface-bright'>
      <Sidebar />
      <main className='flex-1 ml-0 md:ml-[260px] h-full overflow-y-auto'>
        {children}
      </main>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route path='/' element={<RootRedirect />} />

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

          {/* --- Estudiante (solo lectura) --- */}
          <Route element={<RoleRoute allow={['student']} />}>
            <Route path='/materias' element={<StudentSubjects />} />
          </Route>
        </Route>
      </Route>

      <Route path='*' element={<NotFound />} />
      <Route path='/' element={<Navigate to='/login' replace />} />

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

      {/* RUTAS PARA ACTIVIDADES (vista docente/admin) */}
      <Route
        path='/admin/cursos/:cursoId/actividades/nueva'
        element={
          <AdminLayout>
            <CrearActividadPage />
          </AdminLayout>
        }
      />
      {/* RUTAS PARA ACTIVIDADES (vista estudiante) */}
      <Route
        path='/estudiante/cursos/:cursoId/actividades/:idTask'
        element={
          <AdminLayout>
            <StudentTaskDetailPage />
          </AdminLayout>
        }
      />
      
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