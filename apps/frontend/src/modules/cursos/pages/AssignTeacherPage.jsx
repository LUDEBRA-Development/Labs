import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { getCourse, assignTeacher, removeTeacher } from '../api/courses'
import { usersService } from '../../../lib/usersService'

export default function AssignTeacherPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [teachers, setTeachers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const [courseData, userList] = await Promise.all([
          getCourse(id),
          usersService.list('teacher').catch(() => []),
        ])
        if (!active) return
        const activeTeachers = userList.filter((u) => u.isActive)
        setCourse(courseData)
        setTeachers(activeTeachers)
        setSelectedId(courseData?.teacher?.email ?? '')
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

  const filtered = teachers.filter((t) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    const fullName = `${t.firstName} ${t.lastName}`.toLowerCase()
    return (
      fullName.includes(q) ||
      (t.email || '').toLowerCase().includes(q) ||
      (t.email || '').toLowerCase().includes(q)
    )
  })

  async function handleAssign(e) {
    e.preventDefault()
    if (!selectedId) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const updated = await assignTeacher(id, selectedId)
      setCourse(updated)
      setSuccess('Docente asignado correctamente')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove() {
    setRemoving(true)
    setError(null)
    setSuccess(null)
    try {
      const updated = await removeTeacher(id)
      setCourse(updated)
      setSelectedId('')
      setSuccess('Docente removido del curso')
    } catch (err) {
      setError(err.message)
    } finally {
      setRemoving(false)
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
          <h2 className="font-headline-lg text-headline-lg text-primary">Asignar Docente</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-2xl">
            Asigne al instructor responsable de <span className="font-medium text-primary">{course?.name}</span>
            {' '}(ID: {course?.idCourse}).
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-[0px_4px_20px_rgba(30,55,65,0.05)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-secondary-container" />
            <h3 className="font-headline-md text-headline-md text-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary-container">person_search</span>
              Seleccionar Docente
            </h3>

            <div className="relative mb-6">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, email o UUID..."
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-10 pr-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all placeholder:text-on-surface-variant/50"
              />
            </div>

            {teachers.length === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant">
                No hay docentes activos registrados. Crea docentes en la gestión de usuarios.
              </p>
            ) : filtered.length === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant">
                No se encontraron docentes con "{search}".
              </p>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-2">
                {filtered.map((t) => {
                  const fullName = `${t.firstName ?? ''} ${t.lastName ?? ''}`.trim()
                  const initials = fullName
                    .split(' ')
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()
                  const selected = selectedId === t.email
                  return (
                    <label
                      key={t.email}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selected
                          ? 'border-secondary bg-surface-container-low shadow-sm'
                          : 'border-outline-variant/50 hover:bg-surface-container-low'
                      }`}
                    >
                      <input
                        type="radio"
                        name="teacher"
                        className="accent-[#00AFEB] w-4 h-4"
                        checked={selected}
                        onChange={() => setSelectedId(t.email)}
                      />
                      <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md font-bold shrink-0">
                        {initials || '—'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-label-md text-label-md text-primary font-bold truncate">
                          {fullName || 'Sin nombre'}
                        </p>
                        <p className="font-body-md text-[12px] text-on-surface-variant truncate">{t.email}</p>
                      </div>
                      {course?.teacher?.email === t.email && (
                        <span className="text-xs font-medium bg-primary-container text-on-primary px-2 py-1 rounded-full shrink-0">
                          Asignado
                        </span>
                      )}
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_4px_20px_rgba(30,55,65,0.05)] border border-outline-variant/30">
            <h3 className="font-headline-md text-[18px] leading-tight text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">person_add</span>
              Instructor del curso
            </h3>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md font-bold shrink-0">
                {course?.teacher
                  ? `${course.teacher.firstName?.[0] ?? ''}${course.teacher.lastName?.[0] ?? ''}`.toUpperCase()
                  : '—'}
              </div>
              <div className="min-w-0">
                {course?.teacher ? (
                  <>
                    <p className="font-label-md text-label-md text-primary font-bold truncate">
                      {`${course.teacher.firstName ?? ''} ${course.teacher.lastName ?? ''}`.trim() || 'Docente'}
                    </p>
                    <p className="font-body-md text-[12px] text-on-surface-variant truncate">{course.teacher.email}</p>
                  </>
                ) : (
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Sin docente asignado aún
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleAssign}
                disabled={saving || !selectedId}
                className="w-full px-6 py-2.5 rounded-lg font-label-md text-label-md bg-[#00AFEB] text-white hover:opacity-90 transition-opacity shadow-[0px_4px_20px_rgba(30,55,65,0.05)] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    Asignar Docente
                  </>
                )}
              </button>

              {course?.teacher && (
                <button
                  onClick={handleRemove}
                  disabled={removing}
                  className="w-full px-6 py-2.5 rounded-lg font-label-md text-label-md border border-state-error/30 text-state-error hover:bg-state-error-container transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {removing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-state-error border-t-transparent rounded-full animate-spin" />
                      Quitando...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">person_remove</span>
                      Quitar docent
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
