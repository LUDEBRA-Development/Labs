import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 bg-slate-900 text-white">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-slate-400">Esta página no existe.</p>
      <Link to="/" className="text-sky-400 hover:underline">Volver al inicio</Link>
    </div>
  )
}
