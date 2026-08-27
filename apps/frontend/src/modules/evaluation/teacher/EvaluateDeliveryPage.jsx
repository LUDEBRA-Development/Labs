import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toApiAssetUrl } from "../api/http";
import {
  getDelivery,
  qualifyTask,
  saveEvaluationDraft,
} from "../api/userTasks";
import { ErrorState, LoadingState } from "../components/EvaluationUi";
import { Icon } from "../components/Icons";

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
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

function initials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const EMPTY_FORM = {
  qualification: "",
  feedbackComments: "",
  selectedCriteria: [],
};

export function EvaluateDeliveryPage() {
  const { idTask, emailUser: encodedEmail } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const numericTaskId = Number(idTask);
  const emailUser = useMemo(() => decodeEmail(encodedEmail), [encodedEmail]);
  const [detail, setDetail] = useState(null);
  const [pageStatus, setPageStatus] = useState("loading");
  const [pageError, setPageError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [savingAction, setSavingAction] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const activityCode =
    searchParams.get("activityCode") ?? detail?.activity.code ?? "";
  const trackingUrl = `/evaluacion/docente/actividades?activityCode=${encodeURIComponent(activityCode)}`;

  const setDetailAndForm = useCallback((data) => {
    setDetail(data);
    setForm({
      qualification: data.evaluation.qualification ?? "",
      feedbackComments: data.evaluation.feedbackComments ?? "",
      selectedCriteria: data.evaluation.selectedCriteria ?? [],
    });
  }, []);

  const loadDelivery = useCallback(async () => {
    setPageStatus("loading");
    setPageError("");
    if (!Number.isInteger(numericTaskId) || numericTaskId < 1 || !emailUser) {
      setPageStatus("error");
      setPageError("La identificación de la entrega no es válida.");
      return;
    }

    try {
      const data = await getDelivery(numericTaskId, emailUser);
      setDetailAndForm(data);
      setPageStatus("success");
    } catch (loadError) {
      setPageStatus("error");
      setPageError(loadError.message);
    }
  }, [emailUser, numericTaskId, setDetailAndForm]);

  useEffect(() => {
    const timeoutId = window.setTimeout(loadDelivery, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadDelivery]);

  function toggleCriterion(criterionId) {
    setForm((current) => ({
      ...current,
      selectedCriteria: current.selectedCriteria.includes(criterionId)
        ? current.selectedCriteria.filter((id) => id !== criterionId)
        : [...current.selectedCriteria, criterionId],
    }));
  }

  function validatePublishedGrade() {
    const score = Number(form.qualification);
    const maxScore = Number(detail.activity.maxScore);
    if (form.qualification === "" || Number.isNaN(score)) {
      return "Ingresa una calificación válida.";
    }
    if (score < 0 || score > maxScore) {
      return `La calificación debe estar entre 0 y ${maxScore}.`;
    }
    if (!form.feedbackComments.trim()) {
      return "La retroalimentación es obligatoria para publicar la calificación.";
    }
    if (form.feedbackComments.trim().length > 500) {
      return "La retroalimentación no puede superar 500 caracteres.";
    }
    return "";
  }

  async function handleSaveDraft() {
    setSavingAction("draft");
    setFormError("");
    setSuccessMessage("");
    try {
      const payload = {
        feedbackComments: form.feedbackComments,
        selectedCriteria: form.selectedCriteria,
        ...(form.qualification !== "" && {
          qualification: Number(form.qualification),
        }),
      };
      const data = await saveEvaluationDraft(
        numericTaskId,
        emailUser,
        payload,
      );
      setDetailAndForm(data);
      setSuccessMessage("Borrador guardado. La entrega aún no se marcó como calificada.");
    } catch (saveError) {
      setFormError(saveError.message);
    } finally {
      setSavingAction("");
    }
  }

  async function handlePublish(event) {
    event.preventDefault();
    const validationMessage = validatePublishedGrade();
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    setSavingAction("publish");
    setFormError("");
    setSuccessMessage("");
    try {
      const data = await qualifyTask(numericTaskId, emailUser, {
        qualification: Number(form.qualification),
        feedbackComments: form.feedbackComments.trim(),
        selectedCriteria: form.selectedCriteria,
      });
      setDetailAndForm(data);
      setSuccessMessage("Calificación guardada y seguimiento actualizado.");
      window.setTimeout(() => navigate(trackingUrl), 900);
    } catch (saveError) {
      setFormError(saveError.message);
    } finally {
      setSavingAction("");
    }
  }

  if (pageStatus === "loading") {
    return (
      <section className="academic-card">
        <LoadingState label="Cargando la entrega y su evaluación…" />
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

  const { activity, student, delivery, evaluation } = detail;
  const fileUrl = toApiAssetUrl(delivery.file?.url);
  const isSaving = Boolean(savingAction);

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <Link
          aria-label="Volver al seguimiento"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#42484a] transition hover:bg-[#f1f4f6]"
          to={trackingUrl}
        >
          <Icon className="h-5 w-5" name="arrowLeft" />
        </Link>
        <div>
          <h1 className="font-serif text-[26px] font-semibold leading-8 text-[#06222b] sm:text-[30px]">
            Evaluación: {activity.name}
          </h1>
          <p className="mt-1 font-mono text-xs uppercase tracking-wider text-[#42484a]">
            {activity.course.name}
          </p>
        </div>
      </header>

      {successMessage && (
        <div
          className="flex items-start gap-3 rounded-xl border border-[#a9dfc5] bg-[#edf9f3] px-4 py-3 text-sm text-[#145c3d]"
          role="status"
        >
          <Icon className="mt-0.5 h-5 w-5 shrink-0" name="check" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <section className="space-y-6">
          <article className="academic-card flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
            {student.profilePicture ? (
              <img
                alt=""
                className="h-16 w-16 shrink-0 rounded-full object-cover"
                src={student.profilePicture}
              />
            ) : (
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#c4e7ff] font-mono text-lg font-semibold text-[#004d6a]">
                {initials(student.name) || "ES"}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="font-serif text-2xl font-semibold text-[#06222b]">
                {student.name}
              </h2>
              <div className="mt-2 flex flex-col gap-2 text-sm text-[#42484a] sm:flex-row sm:flex-wrap sm:gap-x-5">
                <span className="flex items-center gap-1.5">
                  <Icon className="h-4 w-4" name="user" />
                  ID: {student.institutionalCode}
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon className="h-4 w-4" name="clock" />
                  Entregado: {formatDate(delivery.deliveryDate)} (
                  {delivery.punctuality === "on_time" ? "A tiempo" : "Fuera de plazo"})
                </span>
              </div>
            </div>
            <span className="rounded-full border border-[#c2c7cb]/60 bg-[#f1f4f6] px-3 py-1.5 font-mono text-xs text-[#42484a]">
              {delivery.attempt === 1 ? "1er Intento" : `${delivery.attempt}º Intento`}
            </span>
          </article>

          <article className="academic-card overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-[#e0e3e5] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#eaf1f4] text-[#00668a]">
                  <Icon className="h-5 w-5" name="fileText" />
                </span>
                <span className="truncate font-medium text-[#06222b]">
                  {delivery.file?.name ?? "Sin archivo adjunto"}
                </span>
              </div>
              {fileUrl && (
                <a
                  className="ghost-button self-start whitespace-nowrap font-mono text-sm sm:self-auto"
                  download={delivery.file.name}
                  href={fileUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Icon className="h-4 w-4" name="arrowRight" />
                  Descargar original
                </a>
              )}
            </div>

            <div className="relative min-h-[620px] bg-[#e0e3e5]/35 p-5 sm:p-6">
              <div className="relative z-10 mb-5 max-w-xl rounded-lg border border-[#e0e3e5] bg-white p-4 shadow-[0_8px_24px_rgba(30,55,65,0.10)]">
                <p className="text-sm italic leading-6 text-[#42484a]">
                  “{delivery.comment || "El estudiante no agregó comentarios a esta entrega."}”
                </p>
              </div>

              {delivery.file?.canPreview && fileUrl ? (
                <iframe
                  className="h-[720px] w-full rounded-lg border border-[#c2c7cb]/50 bg-white shadow-sm"
                  src={fileUrl}
                  title={`Vista previa de ${delivery.file.name}`}
                />
              ) : (
                <div className="grid min-h-[500px] place-items-center rounded-lg border border-[#c2c7cb]/50 bg-white px-6 text-center shadow-sm">
                  <div className="max-w-md">
                    <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eaf1f4] text-[#00668a]">
                      <Icon className="h-7 w-7" name="fileText" />
                    </span>
                    <h3 className="mt-4 font-semibold text-[#06222b]">
                      {delivery.file
                        ? "Vista previa no disponible"
                        : "No hay archivo adjunto"}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#42484a]">
                      {delivery.file
                        ? "Este formato no puede mostrarse en el navegador. Puedes descargar el archivo original."
                        : "La entrega contiene el comentario del estudiante, pero no tiene un archivo asociado."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </article>
        </section>

        <form
          className="academic-card sticky top-6 overflow-hidden shadow-[0_8px_32px_rgba(30,55,65,0.12)]"
          noValidate
          onSubmit={handlePublish}
        >
          <div className="bg-[#06222b] p-6 text-white">
            <h2 className="font-serif text-2xl font-semibold">Panel de Evaluación</h2>
            <p className="mt-1 text-sm text-[#b0cbd7]">Rúbrica estándar de laboratorio</p>
          </div>

          <div className="space-y-7 p-6">
            {evaluation.hasDraft && (
              <div className="rounded-lg border border-[#f0cf93] bg-[#fff8e9] px-3 py-2 text-sm text-[#7a4d0a]">
                Estás viendo un borrador guardado.
              </div>
            )}

            <label className="block text-sm font-medium text-[#06222b]">
              Calificación Final (0-{activity.maxScore})
              <div className="relative mt-2">
                <input
                  aria-label="Calificación final"
                  className="w-full rounded-lg border-2 border-[#c2c7cb] bg-[#f7fafc] px-4 py-4 pr-24 text-center font-mono text-4xl font-semibold text-[#06222b] outline-none transition focus:border-[#00afeb] focus:ring-4 focus:ring-[#c4e7ff]"
                  max={activity.maxScore}
                  min="0"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      qualification: event.target.value,
                    }))
                  }
                  placeholder="--"
                  step="0.01"
                  type="number"
                  value={form.qualification}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xl text-[#42484a]">
                  /{activity.maxScore}
                </span>
              </div>
            </label>

            <fieldset>
              <legend className="font-mono text-xs font-medium uppercase tracking-wider text-[#06222b]">
                Criterios clave
              </legend>
              <div className="mt-3 space-y-3">
                {activity.rubric.map((criterion) => (
                  <label
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#c2c7cb]/60 p-3 text-sm text-[#181c1e] transition hover:bg-[#f1f4f6]"
                    key={criterion.id}
                  >
                    <input
                      checked={form.selectedCriteria.includes(criterion.id)}
                      className="h-5 w-5 rounded border-[#c2c7cb] accent-[#00afeb]"
                      onChange={() => toggleCriterion(criterion.id)}
                      type="checkbox"
                    />
                    <span>{criterion.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="block text-sm font-medium text-[#06222b]">
              Retroalimentación al estudiante
              <textarea
                className="mt-2 min-h-44 w-full resize-y rounded-lg border border-[#c2c7cb] bg-[#f7fafc] p-4 text-sm leading-6 text-[#181c1e] outline-none transition focus:border-[#00afeb] focus:ring-4 focus:ring-[#c4e7ff]"
                maxLength="500"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    feedbackComments: event.target.value,
                  }))
                }
                placeholder={`Escribe aquí los comentarios detallados para ${student.name.split(" ")[0]}…`}
                value={form.feedbackComments}
              />
              <span className="mt-1 block text-right font-mono text-xs font-normal text-[#72787b]">
                {form.feedbackComments.length}/500
              </span>
            </label>

            {formError && (
              <div className="flex gap-2 rounded-lg bg-[#ffdad6] px-3 py-2 text-sm text-[#93000a]" role="alert">
                <Icon className="mt-0.5 h-4 w-4 shrink-0" name="x" />
                <span>{formError}</span>
              </div>
            )}
          </div>

          <div className="grid gap-3 border-t border-[#e0e3e5] p-5 sm:grid-cols-2 lg:grid-cols-[auto_1fr]">
            <button
              className="secondary-button whitespace-nowrap"
              disabled={isSaving}
              onClick={handleSaveDraft}
              type="button"
            >
              {savingAction === "draft" ? "Guardando…" : "Guardar borrador"}
            </button>
            <button className="primary-button whitespace-nowrap" disabled={isSaving} type="submit">
              {savingAction === "publish" ? "Guardando…" : "Guardar calificación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
