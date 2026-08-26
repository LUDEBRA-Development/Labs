import { useState } from "react";
import { getStudentHistory, submitTask } from "./api";

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
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)]">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
          Estudiante
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Entregar actividad
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          La plataforma validará automáticamente que la fecha límite no haya
          vencido.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            Correo institucional
            <input
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              type="email"
              value={emailUser}
              onChange={(event) => setEmailUser(event.target.value)}
              required
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Identificador de la actividad
            <input
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              type="number"
              min="1"
              value={taskId}
              onChange={(event) => setTaskId(event.target.value)}
              required
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Comentario de la entrega
            <textarea
              className="mt-2 min-h-32 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              maxLength="500"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
          </label>

          <button
            className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? "Procesando…" : "Registrar entrega"}
          </button>
        </form>

        {feedback && (
          <p
            className={`mt-5 rounded-xl px-4 py-3 text-sm ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800"
                : "bg-rose-50 text-rose-800"
            }`}
            role="status"
          >
            {feedback.text}
          </p>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
              Seguimiento
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">
              Historial de entregas
            </h2>
          </div>
          <button
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-700 disabled:opacity-60"
            disabled={!emailUser || loading}
            onClick={loadHistory}
            type="button"
          >
            Actualizar historial
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {history.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center text-sm text-slate-500">
              Ingresa tu correo y consulta el historial.
            </div>
          ) : (
            history.map((delivery) => (
              <article
                className="rounded-2xl border border-slate-200 p-5"
                key={`${delivery.emailUser}-${delivery.idTask}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-950">
                      {delivery.task?.name ?? `Actividad ${delivery.idTask}`}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Entregada: {formatDate(delivery.deliveryDate)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      delivery.qualification == null
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {delivery.qualification == null
                      ? "Pendiente de calificar"
                      : `${delivery.qualification} / ${delivery.task?.maxScore ?? 5}`}
                  </span>
                </div>

                {delivery.comment && (
                  <p className="mt-4 text-sm text-slate-600">
                    <strong>Tu comentario:</strong> {delivery.comment}
                  </p>
                )}
                {delivery.feedbackComments && (
                  <div className="mt-4 rounded-xl bg-indigo-50 p-4 text-sm text-indigo-950">
                    <strong>Retroalimentación docente:</strong>{" "}
                    {delivery.feedbackComments}
                    <p className="mt-1 text-xs text-indigo-700">
                      Calificada: {formatDate(delivery.qualificationDate)}
                    </p>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
