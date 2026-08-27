import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCourse, listEnrollments } from '../api/courses'

function Initials({ firstName, lastName, className = '' }) {
  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || '—'
  return <div className={`flex items-center justify-center rounded-full bg-secondary-container font-semibold text-on-secondary-container ${className}`}>{initials}</div>
}

export default function CourseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  async function loadDetail() {
    setLoading(true)
    setError(null)
    try {
      const [courseData, enrollmentData] = await Promise.all([getCourse(id), listEnrollments(id)])
      setCourse(courseData)
      setEnrollments(enrollmentData)
    } catch (err) {
      setError(err.message)
      setCourse(null)
    } finally {
      setLoading(false)
    }
  }

  // Se difiere la carga para no actualizar estado de forma sincrónica dentro del efecto.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { queueMicrotask(loadDetail) }, [id])

  const filteredEnrollments = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return enrollments
    return enrollments.filter(({ user, userId }) => `${user?.firstName ?? ''} ${user?.lastName ?? ''} ${user?.email ?? ''} ${userId}`.toLowerCase().includes(query))
  }, [enrollments, search])

  if (loading) return <div className="py-24 text-center text-on-surface-variant">Cargando...</div>

  if (error) return <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-8 md:py-12">
    <button onClick={() => navigate('/admin/cursos')} className="mb-6 inline-flex items-center gap-2 text-primary hover:text-secondary"><span className="material-symbols-outlined">arrow_back</span>Volver a Cursos</button>
    <div className="rounded-xl bg-state-error-container p-6 text-state-error"><p>{error === 'Curso no encontrado' ? 'Curso inexistente.' : 'No se pudo cargar la información.'}</p><button onClick={loadDetail} className="mt-3 underline">Reintentar</button></div>
  </div>

  const teacher = course.teacher
  return <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-8 md:py-12">
    <header className="mb-12 flex flex-col gap-6">
      <button onClick={() => navigate('/admin/cursos')} className="inline-flex w-fit items-center gap-2 font-label-md text-primary hover:text-secondary"><span className="material-symbols-outlined text-[20px]">arrow_back</span>Volver a Cursos</button>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="mb-3 flex items-center gap-3"><span className="rounded-full bg-primary px-4 py-1.5 font-label-md text-on-primary">{course.code}</span><span className="font-body-md text-on-surface-variant">ID: {course.idCourse}</span></div>
          <h1 className="font-headline-lg text-headline-lg text-primary">{course.name}</h1>
        </div>
        <button onClick={() => navigate(`/admin/cursos/${id}/editar`)} className="inline-flex items-center gap-2 rounded-lg border border-primary px-5 py-2.5 font-label-md text-primary hover:bg-surface-container-low"><span className="material-symbols-outlined text-[18px]">edit</span>Editar curso</button>
      </div>
    </header>

    <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-5">
      <section className="relative overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-7 shadow-[0px_4px_20px_rgba(30,55,65,0.05)] lg:col-span-2">
        <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-secondary-container/20" />
        <h2 className="relative mb-8 flex items-center gap-3 font-headline-md text-primary"><span className="material-symbols-outlined text-secondary">person_check</span>Docente asignado</h2>
        {teacher ? <div className="relative flex flex-col items-center text-center"><Initials firstName={teacher.firstName} lastName={teacher.lastName} className="mb-5 h-20 w-20 text-2xl" /><p className="font-headline-md text-on-surface">{teacher.firstName} {teacher.lastName}</p><p className="mt-2 flex items-center gap-2 text-on-surface-variant"><span className="material-symbols-outlined text-[17px] text-secondary">mail</span>{teacher.email}</p><button onClick={() => navigate(`/admin/cursos/${id}/docente`)} className="mt-6 text-sm font-medium text-secondary hover:underline">Cambiar docente</button></div> : <div className="relative py-8 text-center"><span className="material-symbols-outlined mb-3 block text-5xl text-on-surface-variant/40">person_off</span><p className="text-on-surface-variant">Sin docente asignado</p><button onClick={() => navigate(`/admin/cursos/${id}/docente`)} className="mt-5 rounded-lg bg-secondary px-4 py-2 font-label-md text-on-secondary">Asignar docente</button></div>}
      </section>

      <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-7 shadow-[0px_4px_20px_rgba(30,55,65,0.05)] lg:col-span-3">
        <h2 className="mb-6 font-headline-md text-primary">Información del curso</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-surface-container-low p-5"><p className="text-sm text-on-surface-variant">Código</p><p className="mt-2 font-headline-md text-primary">{course.code}</p></div>
          <div className="rounded-xl bg-surface-container-low p-5"><p className="text-sm text-on-surface-variant">Estudiantes matriculados</p><p className="mt-2 font-headline-md text-primary">{enrollments.length}</p></div>
          <div className="rounded-xl bg-surface-container-low p-5 sm:col-span-2"><p className="text-sm text-on-surface-variant">Descripción</p><p className="mt-2 text-on-surface">{course.description || 'Sin descripción registrada.'}</p></div>
        </div>
      </section>
    </div>

    <section className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-[0px_4px_20px_rgba(30,55,65,0.05)]">
      <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3"><h2 className="font-headline-md text-primary">Estudiantes matriculados</h2><span className="rounded-full bg-secondary-container px-3 py-1 font-label-md text-on-secondary-container">{enrollments.length} matriculado{enrollments.length === 1 ? '' : 's'}</span></div>
        <div className="flex flex-col gap-3 sm:flex-row"><label className="relative"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar estudiante..." className="w-full rounded-lg border border-outline-variant bg-white py-2.5 pl-10 pr-4 outline-none focus:border-secondary sm:w-72" /></label><button onClick={() => navigate(`/admin/cursos/${id}/matricula`)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 font-label-md text-on-secondary hover:opacity-90"><span className="material-symbols-outlined text-[18px]">person_add</span>Matricular estudiante</button></div>
      </div>
      {enrollments.length === 0 ? <div className="p-12 text-center text-on-surface-variant">No hay estudiantes matriculados</div> : <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left"><thead className="bg-primary text-on-primary"><tr><th className="px-6 py-4 font-label-md">Nombre del estudiante</th><th className="px-6 py-4 font-label-md">ID de estudiante</th><th className="px-6 py-4 font-label-md">Correo institucional</th></tr></thead><tbody>{filteredEnrollments.map(({ user, userId }, index) => <tr key={userId} className={index % 2 ? 'bg-surface-bright' : ''}><td className="border-b border-outline-variant/20 px-6 py-4"><div className="flex items-center gap-3"><Initials firstName={user?.firstName} lastName={user?.lastName} className="h-10 w-10 shrink-0" /><span className="font-medium text-on-surface">{user ? `${user.firstName} ${user.lastName}` : userId}</span></div></td><td className="border-b border-outline-variant/20 px-6 py-4 text-on-surface-variant">{userId}</td><td className="border-b border-outline-variant/20 px-6 py-4 text-on-surface-variant">{user?.email || '—'}</td></tr>)}</tbody></table>{filteredEnrollments.length === 0 && <p className="p-8 text-center text-on-surface-variant">No se encontraron estudiantes.</p>}</div>}
    </section>
  </div>
}
