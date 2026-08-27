import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTasksByCourse, MOCK_COURSE } from "../api/tasks";
import { getTaskDeliveries } from "../api/userTasks";
import {
  Breadcrumbs,
  ErrorState,
  LoadingState,
  MockTasksNotice,
  StatCard,
} from "../components/EvaluationUi";
import { Icon } from "../components/Icons";

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "long",
  timeStyle: "short",
});

function formatDate(value) {
  return value ? dateFormatter.format(new Date(value)) : "Sin fecha límite";
}

export function TeacherActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const loadActivities = useCallback(async () => {
    setStatus("loading");
    setError("");

    try {
      const tasks = await getTasksByCourse(MOCK_COURSE.idCourse);
      const checkedAt = new Date();
      const tasksWithDeliveries = await Promise.all(
        tasks.map(async (task) => {
          const deliveries = await getTaskDeliveries(task.idTask);
          const qualified = deliveries.filter(
            (delivery) => delivery.qualification != null,
          ).length;

          return {
            ...task,
            deliveryCount: deliveries.length,
            qualifiedCount: qualified,
            pendingCount: deliveries.length - qualified,
            isExpired:
              task.expirationDate &&
              new Date(task.expirationDate).getTime() < checkedAt.getTime(),
          };
        }),
      );

      setActivities(tasksWithDeliveries);
      setStatus("success");
    } catch (loadError) {
      setError(loadError.message);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(loadActivities, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadActivities]);

  const deliveryTotal = activities.reduce(
    (total, task) => total + task.deliveryCount,
    0,
  );
  const pendingTotal = activities.reduce(
    (total, task) => total + task.pendingCount,
    0,
  );

  return (
    <div className="space-y-8 lg:space-y-10">
      <Breadcrumbs current="Mis actividades" />

      <section>
        <p className="technical-label text-[#00668a]">Evaluación docente</p>
        <h1 className="evaluation-font-display mt-2 text-[28px] font-semibold leading-9 tracking-tight text-[#181c1e] sm:text-4xl sm:leading-[44px]">
          Mis actividades
        </h1>
        <p className="mt-3 max-w-[42rem] text-base leading-6 text-[#5b6265]">
          Selecciona una actividad para revisar sus entregas y completar la
          evaluación de los estudiantes.
        </p>
      </section>

      <MockTasksNotice />

      {status === "loading" && (
        <section className="academic-card">
          <LoadingState label="Cargando actividades y conteos de entrega…" />
        </section>
      )}

      {status === "error" && (
        <section className="academic-card">
          <ErrorState message={error} onRetry={loadActivities} />
        </section>
      )}

      {status === "success" && (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            <StatCard
              icon="fileText"
              label="Actividades"
              tone="primary"
              value={activities.length}
            />
            <StatCard
              icon="clipboard"
              label="Entregas recibidas"
              tone="cyan"
              value={deliveryTotal}
            />
            <StatCard
              icon="clock"
              label="Por calificar"
              tone="warning"
              value={pendingTotal}
            />
          </section>

          <section>
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="technical-label text-[#00668a]">
                  {MOCK_COURSE.code}
                </p>
                <h2 className="evaluation-font-display mt-1 text-2xl font-semibold text-[#181c1e]">
                  {MOCK_COURSE.name}
                </h2>
              </div>
              <p className="font-mono text-xs text-[#72787b]">
                Curso: {MOCK_COURSE.idCourse}
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {activities.map((task) => {
                return (
                  <Link
                    className="academic-card group flex min-h-72 flex-col overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-[0_10px_32px_rgba(30,55,65,0.12)]"
                    key={task.idTask}
                    to={`/evaluacion/docente/actividades/${task.idTask}/entregas`}
                  >
                    <div className="flex items-start justify-between gap-4 bg-[#1e3741] px-6 py-5 text-white">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-[#38c2ff]">
                        <Icon className="h-6 w-6" name="fileText" />
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 font-mono text-xs ${
                          task.isExpired
                            ? "bg-[#ffdad6] text-[#93000a]"
                            : "bg-[#d9f3ff] text-[#004d6a]"
                        }`}
                      >
                        {task.isExpired ? "Finalizada" : "Activa"}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <p className="font-mono text-xs font-medium text-[#00668a]">
                        ACTIVIDAD #{task.idTask}
                      </p>
                      <h3 className="evaluation-font-display mt-2 text-xl font-semibold text-[#181c1e]">
                        {task.name}
                      </h3>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#5b6265]">
                        {task.descriptions}
                      </p>

                      <div className="mt-5 flex items-center gap-2 text-sm text-[#42484a]">
                        <Icon
                          className="h-4 w-4 text-[#00668a]"
                          name="calendar"
                        />
                        <span>
                          Fecha límite: {formatDate(task.expirationDate)}
                        </span>
                      </div>

                      <div className="mt-auto grid grid-cols-3 gap-2 border-t border-[#e0e3e5] pt-5 text-center">
                        <div>
                          <p className="font-mono text-lg font-semibold text-[#06222b]">
                            {task.deliveryCount}
                          </p>
                          <p className="text-xs text-[#72787b]">Entregas</p>
                        </div>
                        <div>
                          <p className="font-mono text-lg font-semibold text-[#15734b]">
                            {task.qualifiedCount}
                          </p>
                          <p className="text-xs text-[#72787b]">Calificadas</p>
                        </div>
                        <div>
                          <p className="font-mono text-lg font-semibold text-[#8a5a13]">
                            {task.pendingCount}
                          </p>
                          <p className="text-xs text-[#72787b]">Pendientes</p>
                        </div>
                      </div>

                      <span className="mt-5 inline-flex items-center justify-end gap-2 text-sm font-semibold text-[#00668a]">
                        Ver entregas
                        <Icon
                          className="h-4 w-4 transition-transform group-hover:translate-x-1"
                          name="arrowRight"
                        />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
