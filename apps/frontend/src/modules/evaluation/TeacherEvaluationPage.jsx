import { useState } from "react";
import { getTaskDeliveries, qualifyTask } from "./api";
import {
  Avatar,
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
  return value ? dateFormatter.format(new Date(value)) : "Sin fecha";
}

export function TeacherEvaluationPage() {
  const [taskId, setTaskId] = useState("");
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [qualificationDraft, setQualificationDraft] = useState({
    qualification: "",
    feedbackComments: "",
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const qualifiedCount = deliveries.filter(
    (delivery) => delivery.qualification != null,
  ).length;
  const pendingCount = deliveries.length - qualifiedCount;

  async function loadDeliveries() {
    if (!taskId) return;
    setLoading(true);
    setMessage(null);

    try {
      setDeliveries(await getTaskDeliveries(Number(taskId)));
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }

  function openEvaluation(delivery) {
    setSelectedDelivery(delivery);
    setQualificationDraft({
      qualification: delivery.qualification ?? "",
      feedbackComments: delivery.feedbackComments ?? "",
    });
  }

  function closeEvaluation() {
    if (loading) return;
    setSelectedDelivery(null);
  }

  async function handleQualify(event) {
    event.preventDefault();
    if (!selectedDelivery) return;

    setLoading(true);
    setMessage(null);

    try {
      await qualifyTask(selectedDelivery.idTask, selectedDelivery.emailUser, {
        qualification: Number(qualificationDraft.qualification),
        feedbackComments: qualificationDraft.feedbackComments,
      });
      const refreshedDeliveries = await getTaskDeliveries(Number(taskId));
      setDeliveries(refreshedDeliveries);
      setSelectedDelivery(null);
      setMessage({
        type: "success",
        text: `Calificación registrada para ${selectedDelivery.emailUser}.`,
      });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 lg:space-y-10">
      <Breadcrumbs current="Vista del docente" />

      <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="technical-label text-[#00668a]">Control académico</p>
          <h1 className="mt-2 font-display text-[28px] font-semibold leading-9 tracking-tight text-[#181c1e] sm:text-4xl sm:leading-[44px]">
            Seguimiento de actividades
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-6 text-[#5b6265]">
            Consulta las entregas registradas y completa el ciclo de evaluación
            con una calificación y retroalimentación.
          </p>
        </div>
        <RoleSwitcher />
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
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
          value={pendingCount}
        />
      </section>

      <section className="academic-card p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
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
              />
            </div>
          </label>
          <button
            className="primary-button min-w-40"
            disabled={!taskId || loading}
            onClick={loadDeliveries}
            type="button"
          >
            <Icon name="search" />
            {loading ? "Consultando…" : "Ver entregas"}
          </button>
        </div>

        {message && (
          <div
            className={`mt-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-[#a9dfc5] bg-[#edf9f3] text-[#145c3d]"
                : "border-[#ffb4ab] bg-[#ffdad6] text-[#93000a]"
            }`}
            role="status"
          >
            <Icon name={message.type === "success" ? "check" : "x"} />
            <span>{message.text}</span>
          </div>
        )}
      </section>

      <section className="academic-card overflow-hidden">
        <div className="border-b border-[#e0e3e5] px-6 py-6">
          <p className="technical-label text-[#00668a]">Evaluación docente</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-[#181c1e] sm:text-[28px]">
            Listado de estudiantes y calificaciones
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#5b6265]">
            Entregas registradas para la actividad seleccionada. Los datos de
            nombre y matrícula se incorporarán desde el módulo de usuarios.
          </p>
        </div>

        {deliveries.length === 0 ? (
          <EmptyState
            description="Ingresa el identificador numérico de una actividad para cargar sus entregas."
            title="Selecciona una actividad"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="academic-table min-w-[900px]">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Estado de actividad</th>
                  <th>Fecha de entrega</th>
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
                    <td>
                      <StatusBadge qualified={delivery.qualification != null} />
                    </td>
                    <td className="text-sm text-[#42484a]">
                      {formatDate(delivery.deliveryDate)}
                    </td>
                    <td>
                      {delivery.qualification == null ? (
                        <span className="italic text-[#72787b]">Pendiente</span>
                      ) : (
                        <span className="font-mono font-semibold text-[#06222b]">
                          {delivery.qualification} /{" "}
                          {delivery.task?.maxScore ?? 5}
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      <button
                        className={
                          delivery.qualification == null
                            ? "primary-button py-2 text-sm"
                            : "ghost-button"
                        }
                        onClick={() => openEvaluation(delivery)}
                        type="button"
                      >
                        {delivery.qualification == null
                          ? "Calificar"
                          : "Ver detalle"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedDelivery && (
        <div
          aria-labelledby="evaluation-panel-title"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-[#06222b]/65 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
        >
          <div className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-[0_24px_80px_rgba(6,34,43,0.28)]">
            <div className="flex items-center justify-between border-b border-[#e0e3e5] px-5 py-4 sm:px-7">
              <button
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#42484a] transition hover:text-[#00668a]"
                disabled={loading}
                onClick={closeEvaluation}
                type="button"
              >
                <Icon name="arrowLeft" />
                Volver al listado
              </button>
              <button
                aria-label="Cerrar panel de evaluación"
                className="grid h-10 w-10 place-items-center rounded-lg text-[#72787b] transition hover:bg-[#ebeef0] hover:text-[#181c1e]"
                disabled={loading}
                onClick={closeEvaluation}
                type="button"
              >
                <Icon name="x" />
              </button>
            </div>

            <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
              <div className="space-y-6 bg-[#f7fafc] p-6 sm:p-8">
                <div>
                  <p className="technical-label text-[#00668a]">
                    Detalle de la entrega
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-semibold text-[#181c1e]">
                    {selectedDelivery.task?.name ??
                      `Actividad ${selectedDelivery.idTask}`}
                  </h2>
                </div>

                <article className="academic-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                  <Avatar email={selectedDelivery.emailUser} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-xl font-semibold text-[#181c1e]">
                      {selectedDelivery.emailUser}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-[#5b6265]">
                      <Icon className="h-4 w-4" name="clock" />
                      Entregado: {formatDate(selectedDelivery.deliveryDate)}
                    </p>
                  </div>
                  <StatusBadge
                    qualified={selectedDelivery.qualification != null}
                  />
                </article>

                <article className="academic-card min-h-56 p-6">
                  <p className="technical-label text-[#42484a]">
                    Comentario del estudiante
                  </p>
                  <blockquote className="mt-5 border-l-2 border-[#00afeb] pl-5 text-base italic leading-7 text-[#42484a]">
                    “
                    {selectedDelivery.comment ||
                      "El estudiante no agregó comentarios a esta entrega."}
                    ”
                  </blockquote>
                </article>
              </div>

              <form
                className="flex min-h-full flex-col"
                onSubmit={handleQualify}
              >
                <div className="bg-[#06222b] px-6 py-6 text-white sm:px-8">
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#86a0ac]">
                    Evaluación docente
                  </p>
                  <h2
                    className="mt-2 font-display text-2xl font-semibold"
                    id="evaluation-panel-title"
                  >
                    Panel de calificación
                  </h2>
                  <p className="mt-2 text-sm text-[#b0cbd7]">
                    Puntaje máximo: {selectedDelivery.task?.maxScore ?? 5}
                  </p>
                </div>

                <div className="flex-1 space-y-6 p-6 sm:p-8">
                  <label className="field-label">
                    Calificación final
                    <div className="mt-2 flex items-center rounded-xl border-2 border-[#c2c7cb] bg-[#f1f4f6] px-5 focus-within:border-[#00afeb] focus-within:ring-4 focus-within:ring-[#c4e7ff]">
                      <input
                        className="min-w-0 flex-1 bg-transparent py-5 text-center font-mono text-3xl font-semibold text-[#06222b] outline-none"
                        max={selectedDelivery.task?.maxScore ?? 5}
                        min="0"
                        onChange={(event) =>
                          setQualificationDraft((current) => ({
                            ...current,
                            qualification: event.target.value,
                          }))
                        }
                        placeholder="—"
                        required
                        step="0.01"
                        type="number"
                        value={qualificationDraft.qualification}
                      />
                      <span className="font-mono text-lg text-[#5b6265]">
                        / {selectedDelivery.task?.maxScore ?? 5}
                      </span>
                    </div>
                  </label>

                  <label className="field-label">
                    Retroalimentación al estudiante
                    <textarea
                      className="field-control min-h-48 resize-y"
                      maxLength="500"
                      onChange={(event) =>
                        setQualificationDraft((current) => ({
                          ...current,
                          feedbackComments: event.target.value,
                        }))
                      }
                      placeholder="Escribe observaciones claras sobre los resultados y el procedimiento."
                      required
                      value={qualificationDraft.feedbackComments}
                    />
                    <span className="mt-2 block text-right font-mono text-xs font-normal normal-case tracking-normal text-[#72787b]">
                      {qualificationDraft.feedbackComments.length}/500
                    </span>
                  </label>
                </div>

                <div className="grid gap-3 border-t border-[#e0e3e5] p-6 sm:grid-cols-2">
                  <button
                    className="secondary-button justify-center"
                    disabled={loading}
                    onClick={closeEvaluation}
                    type="button"
                  >
                    Cancelar
                  </button>
                  <button
                    className="primary-button justify-center"
                    disabled={loading}
                    type="submit"
                  >
                    <Icon name="check" />
                    {loading ? "Guardando…" : "Guardar calificación"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
