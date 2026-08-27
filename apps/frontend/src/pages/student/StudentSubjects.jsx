import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getMyEnrollments, getTasksByCourse } from '../../modules/cursos/api/courses'

export function StudentSubjects() {
  const { profile } = useAuth()
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!profile?.email) return
    let active = true
    async function loadSubjects() {
      setLoading(true)
      setError(null)
      try {
        const enrollments = await getMyEnrollments()
        const loaded = await Promise.all(enrollments.map(async ({ course }) => ({
          course,
          tasks: await getTasksByCourse(course.idCourse),
        })))
        if (active) setSubjects(loaded)
      } catch {
        if (active) setError('No se pudieron cargar tus materias.')
      } finally {
        if (active) setLoading(false)
      }
    }
    loadSubjects()
    return () => { active = false }
  }, [profile?.email])

  if (loading) return <p className="py-12 text-center text-slate-500">Cargando tus materias...</p>

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm text-slate-500">Página principal › Mis materias</p>
        <h1 className="text-2xl font-bold text-slate-800">Mis materias</h1>
        <p className="text-slate-500">Cursos en los que estás matriculado y sus actividades.</p>
      </div>
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-red-700">{error}</p>}
      {!error && subjects.length === 0 && <p className="rounded-xl border border-slate-200 bg-white p-8 text-slate-500">No tienes materias matriculadas.</p>}
      <div className="grid gap-6 md:grid-cols-2">
        {subjects.map(({ course, tasks }) => (
          <section key={course.idCourse} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800">{course.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{course.code || course.idCourse}</p>
            <p className="mt-4 text-slate-600">{course.description || 'Sin descripción registrada.'}</p>
            <h3 className="mt-6 border-t border-slate-100 pt-4 font-semibold text-slate-800">Actividades ({tasks.length})</h3>
            {tasks.length === 0 ? <p className="mt-3 text-sm text-slate-500">No hay actividades para este curso.</p> : (
              <ul className="mt-3 space-y-2">
                {tasks.map((task) => (
                  <li key={task.idTask} className="rounded-lg bg-slate-50 px-3 py-3">
                    <Link className="font-medium text-sky-700 hover:underline" to={`/estudiante/cursos/${course.idCourse}/actividades/${task.idTask}`}>
                      {task.name}
                    </Link>
                    <p className="mt-1 text-sm text-slate-500">{task.expirationDate ? `Vence: ${new Date(task.expirationDate).toLocaleString()}` : 'Sin fecha de vencimiento'}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
