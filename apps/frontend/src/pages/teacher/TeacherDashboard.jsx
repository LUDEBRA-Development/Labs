import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getMyTeachingCourses } from '../../modules/cursos/api/courses'

export function TeacherDashboard() {
  const { profile } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!profile?.email) return
    let active = true
    async function loadCourses() {
      setLoading(true)
      setError(null)
      try {
        const data = await getMyTeachingCourses()
        if (active) setCourses(data)
      } catch {
        if (active) setError('No se pudieron cargar tus cursos.')
      } finally {
        if (active) setLoading(false)
      }
    }
    loadCourses()
    return () => { active = false }
  }, [profile?.email])

  if (loading) return <p className="py-12 text-center text-slate-500">Cargando tus cursos...</p>

  return (
    <div className="flex flex-col gap-8">
        <div>
          <p className="text-sm text-slate-500">Página principal › Mis cursos</p>
          <h1 className="text-2xl font-bold text-slate-800">Panel del docente</h1>
          <p className="text-slate-500">Cursos en los que estás asignado.</p>
          <Link to="/campus/simuladores" className="mt-2 inline-flex text-sm font-medium text-sky-700 hover:underline">
            Ver catálogo de simuladores disponibles para habilitar →
          </Link>
        </div>
        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-red-700">{error}</p>}
        {!error && courses.length === 0 && <p className="rounded-xl border border-slate-200 bg-white p-8 text-slate-500">No tienes cursos asignados.</p>}
        <div className="grid gap-6 md:grid-cols-2">
          {courses.map((course) => (
            <Link
              key={course.idCourse}
              to={`/docente/cursos/${course.idCourse}/actividades/nueva`}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-sky-300 hover:shadow"
            >
              <p className="text-sm font-medium text-sky-700">{course.code || course.idCourse}</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-800">{course.name}</h2>
              <p className="mt-3 text-slate-600">{course.description || 'Sin descripción registrada.'}</p>
              <p className="mt-4 text-sm font-medium text-sky-700">Crear nueva actividad →</p>
            </Link>
          ))}
        </div>
      </div>
  )
}
