import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ROLE_HOME } from './roleHome'

// Uso: <Route element={<RoleRoute allow={['admin']} />}> ...rutas de admin... </Route>
// Debe usarse siempre DENTRO de <ProtectedRoute />, que ya garantiza que
// hay sesión y perfil cargado.
export function RoleRoute({ allow }) {
  const { role } = useAuth()

  if (!allow.includes(role)) {
    // No mandamos a /login (ya está logueado), lo mandamos a su propio
    // home para que no vea una ruta que no le corresponde.
    return <Navigate to={ROLE_HOME[role] ?? '/login'} replace />
  }

  return <Outlet />
}
