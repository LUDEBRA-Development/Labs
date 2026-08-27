import { useState } from "react";
import { getStudentHistory, submitTask } from "./api";
import {
  Breadcrumbs,
  EmptyState,
  RoleSwitcher,
  StatCard,
  StatusBadge,
} from "./components/EvaluationUi";
import { Icon } from "./components/Icons";

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value) {
  return value ? dateFormatter.format(new Date(value)) : "Pendiente";
}

export function StudentEvaluationPage() {
  const [emailUser, setEmailUser] = useState("");
  const [taskId, setTaskId] = useState("");
  const [comment, setComment] = useState("");
  const [history, setHistory] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const qualifiedCount = history.filter(
    (delivery) => delivery.qualification != null,
  ).length;
  const pendingCount = history.length - qualifiedCount;

  async function loadHistory() {
    if (!emailUser) return;
    setLoading(true);
    setFeedback(null);

    try {
      setHistory(await getStudentHistory(emailUser));
    } catch (error) {
      setFeedback({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      await submitTask({ emailUser, idTask: Number(taskId), comment });
      setFeedback({
        type: "success",
        text: "Entrega registrada correctamente.",
      });
      setComment("");
      await loadHistory();
    } catch (error) {
      setFeedback({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 lg:space-y-10">
      <Breadcrumbs current="Vista del estudiante" />

      <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="technical-label text-[#00668a]">Panel académico</p>
          <h1 className="evaluation-font-display mt-2 text-[28px] font-semibold leading-9 tracking-tight text-[#181c1e] sm:text-4xl sm:leading-[44px]">
            Mis entregas y calificaciones
          </h1>
          <p className="mt-3 max-w-[42rem] text-base leading-6 text-[#5b6265]">
            Registra una actividad dentro del plazo y consulta la
            retroalimentación del docente.
          </p>
        </div>
        <RoleSwitcher />
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon="clipboard"
          label="Entregas registradas"
          tone="cyan"
          value={history.length}
        />
        <StatCard
          icon="award"
          label="Actividades calificadas"
          tone="success"
          value={qualifiedCount}
        />
        <StatCard
          icon="clock"
          label="Pendientes de calificar"
          tone="warning"
          value={pendingCount}
        />
      </section>

      {feedback && (
        <div
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-[#a9dfc5] bg-[#edf9f3] text-[#145c3d]"
              : "border-[#ffb4ab] bg-[#ffdad6] text-[#93000a]"
          }`}
          role="status"
        >
          <span className="mt-0.5">
            <Icon name={feedback.type === "success" ? "check" : "x"} />
          </span>
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-12">
        <section className="academic-card overflow-hidden xl:col-span-5">
          <div className="bg-[#1e3741] px-6 py-5 text-white">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#86a0ac]">
              Nueva entrega
            </p>
            <h2 className="evaluation-font-display mt-2 text-2xl font-semibold">
              Registrar actividad
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#c4e7ff]">
              La fecha y hora serán registradas automáticamente por el servidor.
            </p>
          </div>

          <form className="space-y-5 p-6" onSubmit={handleSubmit}>
            <label className="field-label">
              Correo institucional
              <input
                autoComplete="email"
                className="field-control"
                placeholder="estudiante@unicesar.edu.co"
                type="email"
                value={emailUser}
                onChange={(event) => setEmailUser(event.target.value)}
                required
              />
              <span className="mt-2 block text-xs font-normal normal-case tracking-normal text-[#72787b]">
                Se reemplazará por la sesión cuando esté disponible el acceso.
              </span>
            </label>

            <label className="field-label">
              Identificador de la actividad
              <div className="relative mt-2">
                <Icon
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#72787b]"
                  name="search"
                />
                <input
                  className="field-control field-control-embedded"
                  min="1"
                  placeholder="Ej: 12"
                  type="number"
                  value={taskId}
                  onChange={(event) => setTaskId(event.target.value)}
                  required
                />
              </div>
            </label>

            <label className="field-label">
              Comentario de la entrega
              <textarea
                className="field-control min-h-32 resize-y"
                maxLength="500"
                placeholder="Describe brevemente los resultados o consideraciones de tu práctica."
                value={comment}
                onChange={(event) => setComment(event.target.value)}
              />
              <span className="mt-2 block text-right font-mono text-xs font-normal normal-case tracking-normal text-[#72787b]">
                {comment.length}/500
              </span>
            </label>

            <button
              className="primary-button w-full"
              disabled={loading}
              type="submit"
            >
              <Icon name="clipboard" />
              {loading ? "Procesando…" : "Registrar entrega"}
            </button>
          </form>
        </section>

        <section className="academic-card overflow-hidden xl:col-span-7">
          <div className="flex flex-col gap-4 border-b border-[#e0e3e5] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="technical-label text-[#00668a]">Seguimiento</p>
              <h2 className="evaluation-font-display mt-2 text-2xl font-semibold text-[#181c1e]">
                Historial académico
              </h2>
            </div>
            <button
              className="secondary-button"
              disabled={!emailUser || loading}
              onClick={loadHistory}
              type="button"
            >
              Actualizar historial
            </button>
          </div>

          {history.length === 0 ? (
            <EmptyState
              description="Ingresa tu correo institucional y consulta las actividades que ya has entregado."
              title="Todavía no hay entregas para mostrar"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="academic-table min-w-[760px]">
                <thead>
                  <tr>
                    <th>Actividad</th>
                    <th>Entrega</th>
                    <th>Estado</th>
                    <th>Calificación</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((delivery) => (
                    <tr key={`${delivery.emailUser}-${delivery.idTask}`}>
                      <td>
                        <p className="font-semibold text-[#181c1e]">
                          {delivery.task?.name ??
                            `Actividad ${delivery.idTask}`}
                        </p>
                        <p className="mt-1 font-mono text-xs text-[#72787b]">
                          ID: {delivery.idTask}
                        </p>
                        {delivery.feedbackComments && (
                          <p className="mt-3 max-w-[24rem] rounded-lg bg-[#eaf1f4] px-3 py-2 text-xs leading-5 text-[#42484a]">
                            <strong>Retroalimentación:</strong>{" "}
                            {delivery.feedbackComments}
                          </p>
                        )}
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
                            {delivery.qualification} /{" "}
                            {delivery.task?.maxScore ?? 5}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
