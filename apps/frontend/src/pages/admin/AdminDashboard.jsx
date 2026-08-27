import { Link } from 'react-router-dom'

export function AdminDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Panel del administrador</h1>
        <p className="text-slate-500">Gestiona quién tiene acceso a LUDEBRA Labs.</p>
      </div>
      <Link
        to="/admin/usuarios"
        className="w-fit rounded-lg bg-sky-700 px-5 py-2.5 font-semibold text-white hover:bg-sky-800"
      >
        Ir a gestión de usuarios
      </Link>
    </div>
  )
}
