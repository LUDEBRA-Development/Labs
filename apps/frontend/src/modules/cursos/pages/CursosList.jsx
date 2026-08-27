import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCourses, deleteCourse } from '../api/courses'
import { useEffect } from 'react'

export default function CursosList() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    loadCourses()
  }, [])

  async function loadCourses() {
    setLoading(true)
    setError(null)
    try {
      const data = await getCourses()
      setCourses(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(course) {
    setDeleting(course.idCourse)
    try {
      await deleteCourse(course.idCourse)
      setCourses((prev) => prev.filter((c) => c.idCourse !== course.idCourse))
      setConfirmDelete(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-8 md:py-12">
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-8 md:py-12">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-headline-lg text-headline-lg text-primary">Cursos</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Gestión de cursos de laboratorio virtual
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/cursos/nuevo')}
          className="px-6 py-2.5 rounded-lg font-label-md text-label-md bg-[#00AFEB] text-white hover:opacity-90 transition-opacity shadow-[0px_4px_20px_rgba(30,55,65,0.05)] flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          Nuevo Curso
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-state-error-container text-state-error rounded-lg font-body-md text-body-md flex items-center gap-2">
          <span className="material-symbols-outlined">error</span>
          {error}
          <button onClick={loadCourses} className="ml-auto underline hover:no-underline">
            Reintentar
          </button>
        </div>
      )}

      {courses.length === 0 && !error ? (
        <div className="bg-surface-container-lowest rounded-xl p-12 shadow-[0px_4px_20px_rgba(30,55,65,0.05)] text-center">
          <span className="material-symbols-outlined text-[64px] text-on-surface-variant/30 block mb-4">
            school
          </span>
          <p className="font-headline-md text-headline-md text-on-surface-variant mb-2">
            No hay cursos registrados
          </p>
          <p className="font-body-md text-body-md text-on-surface-variant/70 mb-6">
            Comienza creando el primer curso de laboratorio virtual.
          </p>
          <button
            onClick={() => navigate('/admin/cursos/nuevo')}
            className="px-6 py-2.5 rounded-lg font-label-md text-label-md bg-[#00AFEB] text-white hover:opacity-90 transition-opacity"
          >
            Crear Curso
          </button>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(30,55,65,0.05)] border border-outline-variant/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-primary-container text-on-primary">
                  <th className="py-4 px-4 sm:px-6 text-left font-label-md text-label-md font-medium">ID</th>
                  <th className="py-4 px-4 sm:px-6 text-left font-label-md text-label-md font-medium">Nombre</th>
                  <th className="py-4 px-4 sm:px-6 text-left font-label-md text-label-md font-medium">Código</th>
                  <th className="py-4 px-4 sm:px-6 text-left font-label-md text-label-md font-medium hidden md:table-cell">
                    Descripción
                  </th>
                  <th className="py-4 px-4 sm:px-6 text-left font-label-md text-label-md font-medium hidden lg:table-cell">Docente</th>
                  <th className="py-4 px-4 sm:px-6 text-right font-label-md text-label-md font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course, i) => (
                  <tr
                    key={course.idCourse}
                    className={`hover:bg-surface-bright transition-colors ${
                      i % 2 === 1 ? 'bg-[#f7fafc]' : ''
                    }`}
                  >
                    <td className="py-4 px-4 sm:px-6 font-label-md text-label-md text-primary font-medium">
                      {course.idCourse}
                    </td>
                    <td className="py-4 px-4 sm:px-6 font-body-md text-body-md text-on-surface font-medium">
                      {course.name}
                    </td>
                    <td className="py-4 px-4 sm:px-6 font-label-md text-label-md text-on-surface-variant">
                      {course.code}
                    </td>
                    <td className="py-4 px-4 sm:px-6 font-body-md text-body-md text-on-surface-variant hidden md:table-cell max-w-xs truncate">
                      {course.description || '—'}
                    </td>
                    <td className="py-4 px-4 sm:px-6 hidden lg:table-cell">
                      {course.teacher ? <span className="inline-flex items-center gap-1 rounded-full bg-state-success-container px-2 py-1 text-xs font-medium text-state-success"><span className="material-symbols-outlined text-[16px]">check_circle</span>Docente asignado</span> : <span className="text-sm text-on-surface-variant">Sin docente</span>}
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <button onClick={() => navigate(`/admin/cursos/${course.idCourse}`)} className="px-2 py-1.5 sm:px-3 rounded-lg font-label-md text-label-md text-primary hover:bg-surface-container-low border border-outline-variant/50 transition-colors flex items-center gap-1" title="Ver detalles"><span className="material-symbols-outlined text-[16px]">visibility</span><span className="hidden xl:inline">Detalles</span></button>
                        <button
                          onClick={() => navigate(`/admin/cursos/${course.idCourse}/docente`)}
                          className="px-2 py-1.5 sm:px-3 rounded-lg font-label-md text-label-md text-primary hover:bg-surface-container-low border border-outline-variant/50 transition-colors flex items-center gap-1"
                          title={course.teacher ? 'Cambiar docente' : 'Asignar docente'}
                        >
                          <span className="material-symbols-outlined text-[16px]">person_add</span>
                          <span className="hidden lg:inline">Docente</span>
                        </button>
                        <button
                          onClick={() => navigate(`/admin/cursos/${course.idCourse}/matricula`)}
                          className="px-2 py-1.5 sm:px-3 rounded-lg font-label-md text-label-md text-primary hover:bg-surface-container-low border border-outline-variant/50 transition-colors flex items-center gap-1"
                          title="Matricular estudiantes"
                        >
                          <span className="material-symbols-outlined text-[16px]">group</span>
                          <span className="hidden lg:inline">Matrícula</span>
                        </button>
                        <button
                          onClick={() => navigate(`/admin/cursos/${course.idCourse}/editar`)}
                          className="px-2 py-1.5 sm:px-3 rounded-lg font-label-md text-label-md text-primary hover:bg-surface-container-low border border-outline-variant/50 transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                          <span className="hidden sm:inline">Editar</span>
                        </button>
                        <button
                          onClick={() => setConfirmDelete(course)}
                          disabled={deleting === course.idCourse}
                          className="px-2 py-1.5 sm:px-3 rounded-lg font-label-md text-label-md text-state-error hover:bg-state-error-container border border-state-error/20 transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                          <span className="hidden sm:inline">{deleting === course.idCourse ? '...' : 'Eliminar'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-outline-variant/30 bg-surface-container-lowest">
            <span className="font-body-md text-body-sm text-on-surface-variant">
              {courses.length} curso{courses.length !== 1 ? 's' : ''} registrado{courses.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !deleting && setConfirmDelete(null)}
          />
          <div className="relative bg-white rounded-xl shadow-modal max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-state-error-container flex items-center justify-center">
                <span className="material-symbols-outlined text-state-error">warning</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-primary">
                Eliminar curso
              </h3>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mb-2">
              ¿Está seguro de que desea eliminar el curso?
            </p>
            <div className="bg-surface-container-low rounded-lg p-3 mb-6">
              <p className="font-label-md text-label-md text-primary font-bold">
                {confirmDelete.name}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                ID: {confirmDelete.idCourse} · Código: {confirmDelete.code}
              </p>
            </div>
            <p className="font-body-sm text-body-sm text-state-error mb-6">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg font-label-md text-label-md border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg font-label-md text-label-md bg-state-error text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
