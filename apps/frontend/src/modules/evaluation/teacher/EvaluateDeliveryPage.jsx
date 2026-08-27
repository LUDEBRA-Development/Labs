import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getTaskById } from "../api/tasks";
import { getDelivery, qualifyTask } from "../api/userTasks";
import {
  Avatar,
  ErrorState,
  LoadingState,
  MockTasksNotice,
  StatusBadge,
} from "../components/EvaluationUi";
import { Icon } from "../components/Icons";

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "long",
  timeStyle: "short",
});

function formatDate(value) {
  return value ? dateFormatter.format(new Date(value)) : "Sin fecha";
}

function decodeEmail(value = "") {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function EvaluateDeliveryPage() {
  const { idTask, emailUser: encodedEmail } = useParams();
  const numericTaskId = Number(idTask);
  const emailUser = useMemo(() => decodeEmail(encodedEmail), [encodedEmail]);
  const [task, setTask] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [pageStatus, setPageStatus] = useState("loading");
  const [pageError, setPageError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ qualification: "", feedbackComments: "" });

  const loadDelivery = useCallback(async () => {
    setPageStatus("loading");
    setPageError("");

    if (!Number.isInteger(numericTaskId) || numericTaskId < 1 || !emailUser) {
      setPageError("La identificación de la entrega no es válida");
      setPageStatus("error");
      return;
    }

    try {
      const [taskData, deliveryData] = await Promise.all([
        getTaskById(numericTaskId),
        getDelivery(numericTaskId, emailUser),
      ]);
      setTask(taskData);
      setDelivery(deliveryData);
      setForm({
        qualification: deliveryData.qualification ?? "",
        feedbackComments: deliveryData.feedbackComments ?? "",
      });
      setPageStatus("success");
    } catch (loadError) {
      setPageError(loadError.message);
      setPageStatus("error");
    }
  }, [emailUser, numericTaskId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(loadDelivery, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadDelivery]);

  const maxScore = Number(task?.maxScore ?? delivery?.task?.maxScore ?? 5);
  const qualified = delivery?.qualification != null;

  function openForm() {
    setForm({
      qualification: delivery.qualification ?? "",
      feedbackComments: delivery.feedbackComments ?? "",
    });
    setFormError("");
    setSuccessMessage("");
    setShowForm(true);
  }

  function validateForm() {
    const qualification = Number(form.qualification);

    if (form.qualification === "" || Number.isNaN(qualification)) {
      return "Ingresa una calificación válida";
    }
    if (qualification < 0 || qualification > maxScore) {
      return `La calificación debe estar entre 0 y ${maxScore}`;
    }
    if (!form.feedbackComments.trim()) {
      return "La retroalimentación es obligatoria";
    }
    if (form.feedbackComments.trim().length > 500) {
      return "La retroalimentación no puede superar 500 caracteres";
    }
    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationMessage = validateForm();
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    setSaving(true);
    setFormError("");
    setSuccessMessage("");

    try {
      await qualifyTask(numericTaskId, emailUser, {
        qualification: Number(form.qualification),
        feedbackComments: form.feedbackComments.trim(),
      });
      const refreshedDelivery = await getDelivery(numericTaskId, emailUser);
      setDelivery(refreshedDelivery);
      setForm({
        qualification: refreshedDelivery.qualification ?? "",
        feedbackComments: refreshedDelivery.feedbackComments ?? "",
      });
      setShowForm(false);
      setSuccessMessage(
        "La calificación y la retroalimentación se guardaron correctamente.",
      );
    } catch (saveError) {
      setFormError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  if (pageStatus === "loading") {
    return (
      <section className="academic-card">
        <LoadingState label="Cargando el detalle de la entrega…" />
      </section>
    );
  }

  if (pageStatus === "error") {
    return (
      <section className="academic-card">
        <ErrorState message={pageError} onRetry={loadDelivery} />
      </section>
    );
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center gap-2 text-sm text-[#72787b]">
        <Link
          className="hover:text-[#00668a]"
          to="/evaluacion/docente/actividades"
        >
          Mis actividades
        </Link>
        <span aria-hidden="true">›</span>
        <Link
          className="hover:text-[#00668a]"
          to={`/evaluacion/docente/actividades/${task.idTask}/entregas`}
        >
          Entregas
        </Link>
        <span aria-hidden="true">›</span>
        <span className="font-medium text-[#181c1e]">Evaluar entrega</span>
      </div>

      <div>
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#00668a]"
          to={`/evaluacion/docente/actividades/${task.idTask}/entregas`}
        >
          <Icon className="h-4 w-4" name="arrowLeft" />
          Volver a las entregas
        </Link>
        <p className="technical-label mt-5 text-[#00668a]">
          Evaluación individual
        </p>
        <h1 className="evaluation-font-display mt-2 text-[28px] font-semibold leading-9 tracking-tight text-[#181c1e] sm:text-4xl sm:leading-[44px]">
          {task.name}
        </h1>
      </div>

      <MockTasksNotice />

      {successMessage && (
        <div
          className="flex items-start gap-3 rounded-xl border border-[#a9dfc5] bg-[#edf9f3] px-4 py-3 text-sm text-[#145c3d]"
          role="status"
        >
          <Icon className="mt-0.5 h-5 w-5 shrink-0" name="check" />
          <span>{successMessage}</span>
        </div>
      )}

      <section className="academic-card overflow-hidden">
        <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="space-y-6 bg-[#f7fafc] p-6 sm:p-8">
            <div>
              <p className="technical-label text-[#00668a]">
                Detalle de la entrega
              </p>
              <h2 className="evaluation-font-display mt-2 text-2xl font-semibold text-[#181c1e]">
                Trabajo del estudiante
              </h2>
            </div>

            <article className="academic-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <Avatar email={delivery.emailUser} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-[#181c1e]">
                  {delivery.emailUser}
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-[#5b6265]">
                  <Icon className="h-4 w-4" name="clock" />
                  Entregado: {formatDate(delivery.deliveryDate)}
                </p>
              </div>
              <StatusBadge qualified={qualified} />
            </article>

            <article className="academic-card min-h-64 p-6">
              <p className="technical-label text-[#42484a]">
                Comentario del estudiante
              </p>
              <blockquote className="mt-5 border-l-2 border-[#00afeb] pl-5 text-base italic leading-7 text-[#42484a]">
                “{delivery.comment || "El estudiante no agregó comentarios."}”
              </blockquote>
            </article>
          </div>

          <div className="flex min-h-full flex-col bg-white">
            <div className="bg-[#06222b] px-6 py-6 text-white sm:px-8">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#86a0ac]">
                Evaluación docente
              </p>
              <h2 className="evaluation-font-display mt-2 text-2xl font-semibold">
                Panel de calificación
              </h2>
              <p className="mt-2 text-sm text-[#b0cbd7]">
                Puntaje máximo: {maxScore}
              </p>
            </div>

            {!showForm ? (
              <div className="flex flex-1 flex-col p-6 sm:p-8">
                <div>
                  <p className="field-label">Calificación actual</p>
                  <div className="mt-2 rounded-xl border-2 border-[#c2c7cb] bg-[#f1f4f6] px-5 py-6 text-center">
                    <span className="font-mono text-4xl font-semibold text-[#06222b]">
                      {qualified ? delivery.qualification : "—"}
                    </span>
                    <span className="ml-2 font-mono text-lg text-[#5b6265]">
                      / {maxScore}
                    </span>
                  </div>
                </div>

                <div className="mt-7">
                  <p className="field-label">Retroalimentación registrada</p>
                  <div className="mt-2 min-h-40 rounded-xl border border-[#e0e3e5] bg-[#f7fafc] p-4 text-sm leading-6 text-[#42484a]">
                    {delivery.feedbackComments ||
                      "Esta entrega todavía no tiene retroalimentación."}
                  </div>
                </div>

                <button
                  className="primary-button mt-7 w-full"
                  onClick={openForm}
                  type="button"
                >
                  <Icon name={qualified ? "refresh" : "award"} />
                  {qualified ? "Editar calificación" : "Calificar"}
                </button>
              </div>
            ) : (
              <form
                className="flex flex-1 flex-col"
                noValidate
                onSubmit={handleSubmit}
              >
                <div className="flex-1 space-y-6 p-6 sm:p-8">
                  <label className="field-label">
                    Calificación final
                    <div className="mt-2 flex items-center rounded-xl border-2 border-[#c2c7cb] bg-[#f1f4f6] px-5 focus-within:border-[#00afeb] focus-within:ring-4 focus-within:ring-[#c4e7ff]">
                      <input
                        aria-label="Calificación final"
                        className="min-w-0 flex-1 bg-transparent py-5 text-center font-mono text-3xl font-semibold text-[#06222b] outline-none"
                        max={maxScore}
                        min="0"
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            qualification: event.target.value,
                          }))
                        }
                        placeholder="—"
                        required
                        step="0.01"
                        type="number"
                        value={form.qualification}
                      />
                      <span className="font-mono text-lg text-[#5b6265]">
                        / {maxScore}
                      </span>
                    </div>
                  </label>

                  <label className="field-label">
                    Retroalimentación al estudiante
                    <textarea
                      className="field-control min-h-48 resize-y"
                      maxLength="500"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          feedbackComments: event.target.value,
                        }))
                      }
                      placeholder="Escribe observaciones claras sobre los resultados y el procedimiento."
                      required
                      value={form.feedbackComments}
                    />
                    <span className="mt-2 block text-right font-mono text-xs font-normal normal-case tracking-normal text-[#72787b]">
                      {form.feedbackComments.length}/500
                    </span>
                  </label>

                  {formError && (
                    <div
                      className="flex items-start gap-2 rounded-lg bg-[#ffdad6] px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#93000a]"
                      role="alert"
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0" name="x" />
                      <span>{formError}</span>
                    </div>
                  )}
                </div>

                <div className="grid gap-3 border-t border-[#e0e3e5] p-6 sm:grid-cols-2">
                  <button
                    className="secondary-button"
                    disabled={saving}
                    onClick={() => setShowForm(false)}
                    type="button"
                  >
                    Cancelar
                  </button>
                  <button
                    className="primary-button"
                    disabled={saving}
                    type="submit"
                  >
                    <Icon name="check" />
                    {saving ? "Guardando…" : "Guardar calificación"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
