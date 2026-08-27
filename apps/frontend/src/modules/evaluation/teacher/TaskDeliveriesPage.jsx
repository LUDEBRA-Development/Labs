import { Navigate, useParams } from "react-router-dom";

/**
 * Compatibilidad con la ruta usada por la versión anterior del módulo.
 * La experiencia docente actual concentra el seguimiento en una sola vista.
 */
export function TaskDeliveriesPage() {
  const { idTask } = useParams();
  return (
    <Navigate
      replace
      to={`/evaluacion/docente/actividades?activityCode=${encodeURIComponent(idTask ?? "")}`}
    />
  );
}
