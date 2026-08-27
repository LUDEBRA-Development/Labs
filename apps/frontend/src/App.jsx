import { Routes, Route, Navigate } from 'react-router-dom'
import { CursosList, CourseFormPage, AssignTeacherPage, EnrollStudentsPage, CourseDetailPage } from './modules/cursos'
import { CrearActividadPage } from './modules/actividades'
import { useAuth } from './hooks/useAuth'
import { ProtectedRoute, FullScreenSpinner } from './routes/ProtectedRoute'
import { RoleRoute } from './routes/RoleRoute'
import { ROLE_HOME } from './routes/roleHome'
import { AdminLayout } from './components/layout/AdminLayout'
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
          RUTAS AUTENTICADAS — No-Admin (AppLayout sin sidebar)
      ============================================================ */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>

          {/* --- Docente --- */}
          <Route element={<RoleRoute allow={['teacher']} />}>
            <Route path='/docente' element={<TeacherDashboard />} />
            <Route path='/docente/cursos/:cursoId/actividades/nueva' element={<CrearActividadPage />} />
          </Route>

          {/* --- Estudiante --- */}
          <Route element={<RoleRoute allow={['student']} />}>
            <Route path='/materias' element={<StudentSubjects />} />
            <Route path='/estudiante/cursos/:cursoId/actividades/:idTask' element={<StudentTaskDetailPage />} />
          </Route>

          {/* --- Evaluación: Estudiante --- */}
          <Route element={<RoleRoute allow={['student']} />}>
            <Route path='/evaluacion' element={<StudentEvaluationPage />} />
          </Route>

        </Route>
      </Route>

      {/* --- Evaluación: Docente (layout académico propio) --- */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allow={['teacher']} />}>
          <Route path='/evaluacion/docente/*' element={<TeacherEvaluationPage />} />
        </Route>
      </Route>

      {/* ============================================================
          ADMIN — Dashboard y Secciones (AdminLayout con Sidebar)
      ============================================================ */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allow={['admin']} />}>
          <Route element={<AdminLayout />}>
            {/* Dashboard Principal */}
            <Route path='/admin' element={<AdminDashboard />} />

            {/* Usuarios */}
            <Route path='/admin/usuarios' element={<UsersManagement />} />

            {/* Cursos */}
            <Route path='/admin/cursos' element={<CursosList />} />
            <Route path='/admin/cursos/nuevo' element={<CourseFormPage />} />
            <Route path='/admin/cursos/:id' element={<CourseDetailPage />} />
            <Route path='/admin/cursos/:id/editar' element={<CourseFormPage />} />
            <Route path='/admin/cursos/:id/docente' element={<AssignTeacherPage />} />
            <Route path='/admin/cursos/:id/matricula' element={<EnrollStudentsPage />} />

            {/* Actividades */}
            <Route path='/admin/cursos/:cursoId/actividades/nueva' element={<CrearActividadPage />} />
          </Route>
        </Route>
      </Route>      {/* ============================================================
          CATCH-ALL — 404
      ============================================================ */}
      <Route path='*' element={<Navigate to='/' replace />} />
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
