import { Routes, Route, Navigate } from 'react-router-dom'
import { CursosList, CourseFormPage } from './cursos'
import Sidebar from './components/layout/Sidebar'

function AdminLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-bright">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-[260px] h-full overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/cursos" replace />} />

      <Route
        path="/admin/cursos"
        element={
          <AdminLayout>
            <CursosList />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/cursos/nuevo"
        element={
          <AdminLayout>
            <CourseFormPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/cursos/:id/editar"
        element={
          <AdminLayout>
            <CourseFormPage />
          </AdminLayout>
        }
      />

      <Route path="*" element={<Navigate to="/admin/cursos" replace />} />
    </Routes>
  )
}

export default App
