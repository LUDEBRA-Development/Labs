import { useState } from "react";
import {
  getTaskDeliveries,
  getTeacherNotifications,
  gradeTask,
  markNotificationAsRead,
} from "./api";

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value) {
  return value ? dateFormatter.format(new Date(value)) : "Sin fecha";
}

export function TeacherEvaluationPage() {
  const [teacherEmail, setTeacherEmail] = useState("");
  const [taskId, setTaskId] = useState("");
  const [deliveries, setDeliveries] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [grades, setGrades] = useState({});
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

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

  async function loadNotifications() {
    if (!teacherEmail) return;
    setLoading(true);
    setMessage(null);
    try {
      setNotifications(await getTeacherNotifications(teacherEmail));
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }

  function updateGrade(emailUser, field, value) {
    setGrades((current) => ({
      ...current,
      [emailUser]: { ...current[emailUser], [field]: value },
    }));
  }

  async function handleGrade(delivery) {
    const draft = grades[delivery.emailUser] ?? {};
    setLoading(true);
    setMessage(null);

    try {
      await gradeTask(delivery.taskId, delivery.emailUser, {
        qualification: Number(draft.qualification),
        feedbackComment: draft.feedbackComment ?? "",
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

  async function handleRead(notification) {
    try {
      await markNotificationAsRead(notification.idNotification, teacherEmail);
      await loadNotifications();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[1fr_0.7fr_auto] lg:items-end">
          <label className="block text-sm font-medium text-slate-700">
            Correo del docente
            <input
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              type="email"
              value={teacherEmail}
              onChange={(event) => setTeacherEmail(event.target.value)}
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
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              disabled={!taskId || loading}
              onClick={loadDeliveries}
              type="button"
            >
              Ver entregas
            </button>
            <button
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-indigo-400 hover:text-indigo-700 disabled:opacity-60"
              disabled={!teacherEmail || loading}
              onClick={loadNotifications}
              type="button"
            >
              Ver avisos
            </button>
          </div>
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

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.7fr)]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
            Evaluación docente
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Entregas de la actividad
          </h1>

          <div className="mt-6 space-y-5">
            {deliveries.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center text-sm text-slate-500">
                Selecciona una actividad para consultar sus entregas.
              </div>
            ) : (
              deliveries.map((delivery) => (
                <article
                  className="rounded-2xl border border-slate-200 p-5"
                  key={`${delivery.emailUser}-${delivery.taskId}`}
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
                        value={grades[delivery.emailUser]?.qualification ?? ""}
                        onChange={(event) =>
                          updateGrade(
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
                        maxLength="4000"
                        value={
                          grades[delivery.emailUser]?.feedbackComment ?? ""
                        }
                        onChange={(event) =>
                          updateGrade(
                            delivery.emailUser,
                            "feedbackComment",
                            event.target.value,
                          )
                        }
                      />
                    </label>
                    <button
                      className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                      disabled={
                        loading ||
                        grades[delivery.emailUser]?.qualification ===
                          undefined ||
                        !grades[delivery.emailUser]?.feedbackComment
                      }
                      onClick={() => handleGrade(delivery)}
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

        <aside className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-300">
            Recordatorios
          </p>
          <h2 className="mt-2 text-2xl font-bold">Actividades finalizadas</h2>

          <div className="mt-6 space-y-4">
            {notifications.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-700 p-6 text-sm text-slate-400">
                Consulta los avisos asociados al correo del docente.
              </p>
            ) : (
              notifications.map((notification) => (
                <article
                  className={`rounded-2xl border p-4 ${
                    notification.readAt
                      ? "border-slate-800 bg-slate-900/50"
                      : "border-indigo-400/60 bg-indigo-500/10"
                  }`}
                  key={notification.idNotification}
                >
                  <h3 className="font-semibold">{notification.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {notification.message}
                  </p>
                  <p className="mt-3 text-xs text-slate-500">
                    {formatDate(notification.createdAt)}
                  </p>
                  {!notification.readAt && (
                    <button
                      className="mt-4 text-sm font-semibold text-indigo-300 hover:text-indigo-200"
                      onClick={() => handleRead(notification)}
                      type="button"
                    >
                      Marcar como leído
                    </button>
                  )}
                </article>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
