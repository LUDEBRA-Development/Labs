import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getTaskById } from "../api/tasks";
import { getTaskDeliveries } from "../api/userTasks";
import {
  Avatar,
  EmptyState,
  ErrorState,
  LoadingState,
  MockTasksNotice,
  StatCard,
  StatusBadge,
} from "../components/EvaluationUi";
import { Icon } from "../components/Icons";

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value) {
  return value ? dateFormatter.format(new Date(value)) : "Sin fecha";
}

export function TaskDeliveriesPage() {
  const { idTask } = useParams();
  const numericTaskId = Number(idTask);
  const [task, setTask] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const loadDeliveries = useCallback(async () => {
    setStatus("loading");
    setError("");

    if (!Number.isInteger(numericTaskId) || numericTaskId < 1) {
      setError("El identificador de la actividad no es válido");
      setStatus("error");
      return;
    }

    try {
      const [taskData, deliveryData] = await Promise.all([
        getTaskById(numericTaskId),
        getTaskDeliveries(numericTaskId),
      ]);
      setTask(taskData);
      setDeliveries(deliveryData);
      setStatus("success");
    } catch (loadError) {
      setError(loadError.message);
      setStatus("error");
    }
  }, [numericTaskId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(loadDeliveries, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadDeliveries]);

  const qualifiedCount = deliveries.filter(
    (delivery) => delivery.qualification != null,
  ).length;

  return (
    <div className="space-y-8 lg:space-y-10">
      <div className="flex flex-wrap items-center gap-2 text-sm text-[#72787b]">
        <Link
          className="hover:text-[#00668a]"
          to="/evaluacion/docente/actividades"
        >
          Mis actividades
        </Link>
        <span aria-hidden="true">›</span>
        <span className="font-medium text-[#181c1e]">Entregas</span>
      </div>

      {status === "loading" && (
        <section className="academic-card">
          <LoadingState label="Cargando las entregas de la actividad…" />
        </section>
      )}

      {status === "error" && (
        <section className="academic-card">
          <ErrorState message={error} onRetry={loadDeliveries} />
        </section>
      )}

      {status === "success" && (
        <>
          <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <Link
                className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[#00668a]"
                to="/evaluacion/docente/actividades"
              >
                <Icon className="h-4 w-4" name="arrowLeft" />
                Volver a mis actividades
              </Link>
              <p className="technical-label text-[#00668a]">
                Actividad #{task.idTask}
              </p>
              <h1 className="evaluation-font-display mt-2 text-[28px] font-semibold leading-9 tracking-tight text-[#181c1e] sm:text-4xl sm:leading-[44px]">
                {task.name}
              </h1>
              <p className="mt-3 max-w-[42rem] text-base leading-6 text-[#5b6265]">
                Revisa el estado de cada entrega y abre la evaluación de un
                estudiante para calificarla.
              </p>
            </div>
            <div className="rounded-xl border border-[#c2c7cb] bg-white px-5 py-3 text-sm text-[#42484a] shadow-[0_4px_20px_rgba(30,55,65,0.05)]">
              <span className="font-mono text-xs uppercase text-[#72787b]">
                Fecha límite
              </span>
              <p className="mt-1 font-semibold">
                {formatDate(task.expirationDate)}
              </p>
            </div>
          </section>

          <MockTasksNotice />

          <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              icon="users"
              label="Entregas recibidas"
              tone="cyan"
              value={deliveries.length}
            />
            <StatCard
              icon="award"
              label="Calificadas"
              tone="success"
              value={qualifiedCount}
            />
            <StatCard
              icon="clock"
              label="Por calificar"
              tone="warning"
              value={deliveries.length - qualifiedCount}
            />
          </section>

          <section className="academic-card overflow-hidden">
            <div className="border-b border-[#e0e3e5] px-6 py-6">
              <p className="technical-label text-[#00668a]">
                Seguimiento de la actividad
              </p>
              <h2 className="evaluation-font-display mt-2 text-2xl font-semibold text-[#181c1e] sm:text-[28px]">
                Entregas de estudiantes
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#5b6265]">
                Solo aparecen estudiantes que registraron una entrega en
                User_tasks.
              </p>
            </div>

            {deliveries.length === 0 ? (
              <EmptyState
                description="Todavía no hay entregas registradas para esta actividad."
                title="Sin entregas"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="academic-table min-w-[920px]">
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>Fecha de entrega</th>
                      <th>Estado</th>
                      <th>Calificación</th>
                      <th className="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveries.map((delivery) => (
                      <tr key={`${delivery.emailUser}-${delivery.idTask}`}>
                        <td>
                          <div className="flex items-center gap-3">
                            <Avatar email={delivery.emailUser} />
                            <div>
                              <p className="font-semibold text-[#181c1e]">
                                {delivery.emailUser}
                              </p>
                              <p className="mt-1 font-mono text-xs text-[#72787b]">
                                Actividad #{delivery.idTask}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="text-sm text-[#42484a]">
                          {formatDate(delivery.deliveryDate)}
                        </td>
                        <td>
                          <StatusBadge
                            qualified={delivery.qualification != null}
                          />
                        </td>
                        <td>
                          {delivery.qualification == null ? (
                            <span className="italic text-[#72787b]">
                              Pendiente
                            </span>
                          ) : (
                            <span className="font-mono font-semibold text-[#06222b]">
                              {delivery.qualification} / {task.maxScore}
                            </span>
                          )}
                        </td>
                        <td className="text-right">
                          <Link
                            className={
                              delivery.qualification == null
                                ? "primary-button py-2 text-sm"
                                : "secondary-button py-2 text-sm"
                            }
                            to={`/evaluacion/docente/actividades/${task.idTask}/entregas/${encodeURIComponent(delivery.emailUser)}`}
                          >
                            Evaluación y retroalimentación
                            <Icon className="h-4 w-4" name="arrowRight" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
