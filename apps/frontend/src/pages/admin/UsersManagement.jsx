import { useEffect, useState } from 'react'
import { usersService } from '../../lib/usersService'

const EMPTY_FORM = { firstName: '', lastName: '', email: '', password: '', role: 'student' }

export function UsersManagement() {
  const [users, setUsers] = useState([])
  const [roleFilter, setRoleFilter] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null) // { type: 'error' | 'success', text }

  async function loadUsers(role) {
    setLoading(true)
    try {
      const data = await usersService.list(role || undefined)
      setUsers(data)
    } catch {
      setFeedback({ type: 'error', text: 'No se pudo cargar la lista de usuarios.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Se despacha en una microtarea para no invocar setState de forma
    // síncrona en el cuerpo del efecto (loadUsers hace setLoading(true)
    // como primera línea).
    queueMicrotask(() => loadUsers(roleFilter))
  }, [roleFilter])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFeedback(null)
    setSubmitting(true)
    try {
      await usersService.create(form)
      setFeedback({ type: 'success', text: `Usuario creado: ${form.email}` })
      setForm(EMPTY_FORM)
      loadUsers(roleFilter)
    } catch (err) {
      const message =
        err.response?.data?.message ?? 'No se pudo crear el usuario. Verifica los datos.'
      setFeedback({ type: 'error', text: Array.isArray(message) ? message.join(', ') : message })
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleStatus(user) {
    try {
      await usersService.updateStatus(user.email, !user.isActive)
      loadUsers(roleFilter)
    } catch {
      setFeedback({ type: 'error', text: 'No se pudo actualizar el estado del usuario.' })
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Gestión de usuarios</h1>
        <p className="text-slate-500">Registra docentes y estudiantes, y controla su acceso al sistema.</p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Registrar usuario</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nombre">
            <input name="firstName" value={form.firstName} onChange={handleChange} required
              className="input" />
          </Field>
          <Field label="Apellido">
            <input name="lastName" value={form.lastName} onChange={handleChange} required
              className="input" />
          </Field>
          <Field label="Correo institucional">
            <input type="email" name="email" value={form.email} onChange={handleChange} required
              className="input" />
          </Field>
          <Field label="Contraseña temporal">
            <input type="password" name="password" value={form.password} onChange={handleChange}
              required minLength={6} className="input" />
          </Field>
          <Field label="Rol">
            <select name="role" value={form.role} onChange={handleChange} className="input">
              <option value="student">Estudiante</option>
              <option value="teacher">Docente</option>
            </select>
          </Field>

          <div className="flex items-end sm:col-span-2">
            <button type="submit" disabled={submitting}
              className="rounded-lg bg-sky-700 px-5 py-2.5 font-semibold text-white hover:bg-sky-800 disabled:opacity-60">
              {submitting ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>
        </form>

        {feedback && (
          <p className={`mt-4 rounded-lg px-3 py-2 text-sm ${
            feedback.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            {feedback.text}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Usuarios registrados</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { value: '', label: 'Todos' },
              { value: 'teacher', label: 'Docentes' },
              { value: 'student', label: 'Estudiantes' },
            ].map((opt) => (
              <button key={opt.value} onClick={() => setRoleFilter(opt.value)}
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  roleFilter === opt.value ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Cargando...</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2">Nombre</th>
                <th className="py-2 hidden sm:table-cell">Correo</th>
                <th className="py-2">Rol</th>
                <th className="py-2">Estado</th>
                <th className="py-2 text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.email} className="border-b border-slate-100">
                  <td className="py-2">
                    <p className="font-medium">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-slate-400 sm:hidden">{u.email}</p>
                  </td>
                  <td className="py-2 hidden sm:table-cell">{u.email}</td>
                  <td className="py-2 capitalize">{u.role}</td>
                  <td className="py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      u.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {u.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-2 text-right">
                    <button onClick={() => toggleStatus(u)}
                      className="text-sm font-medium text-sky-700 hover:underline">
                      {u.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className="py-4 text-center text-slate-400">Sin usuarios registrados.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-600">{label}</span>
      {children}
    </label>
  )
}
