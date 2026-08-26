import { useState } from "react";
import { getTaskDeliveries, qualifyTask } from "./api";

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
  const [qualifications, setQualifications] = useState({});
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  async function loadDeliveries() {
    if (!taskId) return;
    setLoading(true);
    setMessage(null);

    try {
      const loadedDeliveries = await getTaskDeliveries(Number(taskId));
      setDeliveries(loadedDeliveries);
      setQualifications(
        Object.fromEntries(
          loadedDeliveries.map((delivery) => [
            delivery.emailUser,
            {
              qualification: delivery.qualification ?? "",
              feedbackComments: delivery.feedbackComments ?? "",
            },
          ]),
        ),
      );
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }

  function updateQualification(emailUser, field, value) {
    setQualifications((current) => ({
      ...current,
      [emailUser]: { ...current[emailUser], [field]: value },
    }));
  }

  async function handleQualify(delivery) {
    const draft = qualifications[delivery.emailUser] ?? {};
    setLoading(true);
    setMessage(null);

    try {
      await qualifyTask(delivery.idTask, delivery.emailUser, {
        qualification: Number(draft.qualification),
        feedbackComments: draft.feedbackComments ?? "",
      });
      setMessage({
        type: "success",
        text: `Calificación registrada para ${delivery.emailUser}.`,
      });
      await loadDeliveries();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <label className="block text-sm font-medium text-slate-700">
            Identificador de la actividad
            <input
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              type="number"
              min="1"
              value={taskId}
              onChange={(event) => setTaskId(event.target.value)}
            />
          </label>
          <button
            className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!taskId || loading}
            onClick={loadDeliveries}
            type="button"
          >
            {loading ? "Consultando…" : "Ver entregas"}
          </button>
        </div>

        {message && (
          <p
            className={`mt-5 rounded-xl px-4 py-3 text-sm ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800"
                : "bg-rose-50 text-rose-800"
            }`}
            role="status"
          >
            {message.text}
          </p>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
          Evaluación docente
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Entregas de la actividad
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Registra la calificación y una retroalimentación para cada estudiante.
        </p>

        <div className="mt-6 space-y-5">
          {deliveries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center text-sm text-slate-500">
              Selecciona una actividad para consultar sus entregas.
            </div>
          ) : (
            deliveries.map((delivery) => (
              <article
                className="rounded-2xl border border-slate-200 p-5"
                key={`${delivery.emailUser}-${delivery.idTask}`}
              >
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-slate-950">
                      {delivery.emailUser}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Entregada: {formatDate(delivery.deliveryDate)}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {delivery.qualification == null
                      ? "Sin calificar"
                      : `Calificación: ${delivery.qualification}`}
                  </span>
                </div>

                {delivery.comment && (
                  <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                    <strong>Comentario:</strong> {delivery.comment}
                  </p>
                )}

                <div className="mt-5 grid gap-4 md:grid-cols-[160px_1fr_auto] md:items-end">
                  <label className="text-sm font-medium text-slate-700">
                    Calificación
                    <input
                      className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                      type="number"
                      min="0"
                      max={delivery.task?.maxScore ?? 5}
                      step="0.01"
                      value={
                        qualifications[delivery.emailUser]?.qualification ?? ""
                      }
                      onChange={(event) =>
                        updateQualification(
                          delivery.emailUser,
                          "qualification",
                          event.target.value,
                        )
                      }
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    Retroalimentación
                    <textarea
                      className="mt-2 min-h-20 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                      maxLength="500"
                      value={
                        qualifications[delivery.emailUser]?.feedbackComments ??
                        ""
                      }
                      onChange={(event) =>
                        updateQualification(
                          delivery.emailUser,
                          "feedbackComments",
                          event.target.value,
                        )
                      }
                    />
                  </label>
                  <button
                    className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={
                      loading ||
                      qualifications[delivery.emailUser]?.qualification ===
                        "" ||
                      !qualifications[
                        delivery.emailUser
                      ]?.feedbackComments?.trim()
                    }
                    onClick={() => handleQualify(delivery)}
                    type="button"
                  >
                    Guardar
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
