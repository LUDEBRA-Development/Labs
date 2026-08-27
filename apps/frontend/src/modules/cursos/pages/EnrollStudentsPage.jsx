import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import {
  getCourse,
  listEnrollments,
  enrollStudent,
  unrollStudent,
} from '../api/courses'
import { usersService } from '../../../lib/usersService'

export default function EnrollStudentsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [students, setStudents] = useState([])
  const [enrolled, setEnrolled] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [success, setSuccess] = useState(null)

  async function loadEnrollments() {
    setEnrolled(await listEnrollments(id))
  }

  useEffect(() => {
    let active = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const [courseData, userList, enrollments] = await Promise.all([
          getCourse(id),
          usersService.list('student').catch(() => []),
          listEnrollments(id).catch(() => []),
        ])
        if (!active) return
        setCourse(courseData)
        setStudents(userList.filter((u) => u.isActive))
        setEnrolled(enrollments)
      } catch (err) {
        if (active) setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [id])

  const enrolledIds = new Set(enrolled.map((e) => e.userId))
  const available = students.filter((s) => !enrolledIds.has(s.email))
  const suggested = available.filter((s) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase()
    return fullName.includes(q) || (s.email || '').toLowerCase().includes(q)
  })

  async function handleEnroll(user) {
    setBusy(true)
    setError(null)
    setSuccess(null)
    try {
      await enrollStudent(id, user.email)
      await loadEnrollments()
      setSuccess('Estudiante matriculado correctamente')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleUnroll(userId) {
    setBusy(true)
    setError(null)
    setSuccess(null)
    try {
      await unrollStudent(id, userId)
      await loadEnrollments()
      setSuccess('Estudiante desmatriculado')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-8 md:py-12">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <button
            onClick={() => navigate('/admin/cursos')}
            className="inline-flex items-center gap-2 text-primary font-label-md text-label-md mb-2 hover:text-secondary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Volver a Cursos
          </button>
          <h2 className="font-headline-lg text-headline-lg text-primary">Matrícula de Estudiantes</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-2xl">
            <span className="font-medium text-primary">{course?.name}</span> (ID: {course?.idCourse}) — gestione la
            matrícula de estudiantes en este curso.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-state-error-container text-state-error rounded-lg font-body-md text-body-md flex items-center gap-2">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-state-success-container text-state-success rounded-lg font-body-md text-body-md flex items-center gap-2">
          <span className="material-symbols-outlined">check_circle</span>
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel: Agregar estudiantes */}
        <div className="lg:col-span-1 bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(30,55,65,0.05)] p-6 border border-outline-variant/20 h-fit">
          <h3 className="font-headline-md text-headline-md text-primary mb-4 text-lg">Agregar Estudiantes</h3>
          <div className="relative mb-4">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o email..."
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-10 pr-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all placeholder:text-on-surface-variant/50"
            />
          </div>

          <div className="bg-surface rounded-lg border border-outline-variant/30 p-2 space-y-1 max-h-[400px] overflow-y-auto">
            <p className="font-label-md text-label-md text-xs text-on-surface-variant px-2 py-1 uppercase tracking-wider">
              Estudiantes disponibles
            </p>
            {students.length === 0 ? (
              <p className="px-2 py-3 text-sm text-on-surface-variant">
                No hay estudiantes activos registrados.
              </p>
            ) : suggested.length === 0 ? (
              <p className="px-2 py-3 text-sm text-on-surface-variant">
                {search
                  ? 'Sin coincidencias con la búsqueda.'
                  : 'Todos los estudiantes activos ya están matriculados.'}
              </p>
            ) : (
              suggested.map((s) => {
                const fullName = `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim()
                const initials = fullName
                  .split(' ')
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()
                return (
                  <div
                    key={s.email}
                    className="flex items-center justify-between p-2 hover:bg-surface-container-low rounded-md transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md text-xs shrink-0">
                        {initials || '—'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-body-md text-body-md text-sm font-medium text-on-surface leading-tight truncate">
                          {fullName || 'Sin nombre'}
                        </p>
                        <p className="font-body-md text-body-md text-xs text-on-surface-variant truncate">{s.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEnroll(s)}
                      disabled={busy}
                      className="text-[#00AFEB] hover:bg-secondary-container hover:text-secondary-container w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 shrink-0"
                      title="Matricular"
                    >
                      <span className="material-symbols-outlined text-sm">person_add</span>
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Panel: Matriculados */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(30,55,65,0.05)] border border-outline-variant/20 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
            <h3 className="font-headline-md text-headline-md text-primary text-lg flex items-center gap-2">
              Matriculados
              <span className="bg-primary-container text-on-primary text-xs py-0.5 px-2 rounded-full font-label-md">
                {enrolled.length}
              </span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            {enrolled.length === 0 ? (
              <div className="p-10 text-center">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 block mb-2">
                  group_off
                </span>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Aún no hay estudiantes matriculados en este curso.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-primary-container text-on-primary">
                    <th className="py-4 px-6 font-label-md text-label-md font-medium text-sm w-5/12">Nombre</th>
                    <th className="py-4 px-6 font-label-md text-label-md font-medium text-sm w-5/12">Email</th>
                    <th className="py-4 px-6 font-label-md text-label-md font-medium text-sm text-right w-2/12">Acciones</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant/20 bg-surface-container-lowest">
                  {enrolled.map((e, i) => {
                    const s = e.user
                    const fullName = `${s?.firstName ?? ''} ${s?.lastName ?? ''}`.trim()
                    const initials = fullName
                      .split(' ')
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                    return (
                      <tr key={`${e.userId}-${e.courseId}`} className={i % 2 === 1 ? 'bg-[#F7FAFC] hover:bg-surface-bright transition-colors' : 'hover:bg-surface-bright transition-colors'}>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center font-label-md text-xs border border-outline-variant/30 shrink-0">
                              {initials || '—'}
                            </div>
                            <span className="font-medium">{fullName || '—'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-on-surface-variant">{s?.email || e.userId}</td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleUnroll(e.userId)}
                            disabled={busy}
                            className="text-state-error hover:bg-error-container p-2 rounded-md transition-colors disabled:opacity-50"
                            title="Desmatricular"
                          >
                            <span className="material-symbols-outlined text-sm">person_remove</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
