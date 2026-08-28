import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getTeacherActivityCodes, getTeacherFollowUp } from "../api/userTasks";
import { ErrorState, LoadingState } from "../components/EvaluationUi";
import { Icon } from "../components/Icons";

function initials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function gradeLabel(value, maxScore) {
  if (value == null) return null;
  return `${Number(value).toLocaleString("es-CO", {
    maximumFractionDigits: 2,
  })} / ${Number(maxScore).toLocaleString("es-CO", {
    maximumFractionDigits: 2,
  })}`;
}

function StatusBadge({ status }) {
  const styles = {
    qualified: "bg-[#d9f3ff] text-[#004d6a]",
    submitted: "bg-[#38c2ff] text-[#004d6a]",
    not_submitted: "bg-[#ffdad6] text-[#93000a]",
  };
  const dots = {
    qualified: "bg-[#00668a]",
    submitted: "bg-white",
    not_submitted: "bg-[#ba1a1a]",
  };
  const labels = {
    qualified: "Calificado",
    submitted: "Entregado",
    not_submitted: "Sin entrega",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status]}`} />
      {labels[status]}
    </span>
  );
}

export function TeacherActivitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCode = searchParams.get("activityCode") ?? "";
  const [activityCode, setActivityCode] = useState(initialCode);
  const [followUp, setFollowUp] = useState(null);
  const [status, setStatus] = useState(initialCode ? "loading" : "idle");
  const [error, setError] = useState("");
  const [activities, setActivities] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [coursesLoading, setCoursesLoading] = useState(true);

  const activityList = useMemo(() => activities, [activities]);
  const courseList = useMemo(() => {
    const unique = new Map();
    activityList.forEach((activity) =>
      unique.set(activity.course.idCourse, activity.course),
    );
    return [...unique.values()];
  }, [activityList]);
  const courseActivities = useMemo(
    () => activityList.filter((a) => a.course.idCourse === selectedCourse),
    [activityList, selectedCourse],
  );

  const loadFollowUp = useCallback(async (code) => {
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) {
      setStatus("error");
      setError("Ingresa el identificador de una actividad.");
      return;
    }

    setStatus("loading");
    setError("");
    try {
      const data = await getTeacherFollowUp(normalizedCode);
      setFollowUp(data);
      setActivityCode(data.activity.code);
      setSearchParams({ activityCode: data.activity.code }, { replace: true });
      setStatus("success");
    } catch (loadError) {
      setFollowUp(null);
      setError(loadError.message);
      setStatus("error");
    }
  }, [setSearchParams]);

  useEffect(() => {
    if (!initialCode) return undefined;
    const timeoutId = window.setTimeout(() => loadFollowUp(initialCode), 0);
    return () => window.clearTimeout(timeoutId);
  }, [initialCode, loadFollowUp]);

  useEffect(() => {
    let active = true;
    getTeacherActivityCodes()
      .then((data) => {
        if (active) setActivities(data ?? []);
      })
      .catch(() => {
        if (active) setActivities([]);
      })
      .finally(() => {
        if (active) setCoursesLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!activityCode) return;
    const match = activities.find((a) => a.code === activityCode);
    if (match && match.course.idCourse !== selectedCourse) {
      setSelectedCourse(match.course.idCourse);
    }
  }, [activityCode, activities, selectedCourse]);

  function handleCourseChange(event) {
    setSelectedCourse(event.target.value);
  }

  function handleActivitySelect(event) {
    const code = event.target.value;
    if (code) loadFollowUp(code);
  }

  function handleSearch(event) {
    event.preventDefault();
    loadFollowUp(activityCode);
  }

  const summary = followUp?.summary;
  const activity = followUp?.activity;
  const rows = useMemo(() => followUp?.students ?? [], [followUp]);

  return (
    <div className="space-y-8">
      <header>
        <nav className="flex flex-wrap items-center gap-2 text-sm text-[#42484a]">
          <span>Página principal</span>
          <span aria-hidden="true">›</span>
          <span>Mis cursos</span>
          <span aria-hidden="true">›</span>
          <span className="font-medium text-[#06222b]">
            {activity?.course.name ?? "Evaluación y seguimiento"}
          </span>
        </nav>
        <h1 className="evaluation-font-display mt-5 text-[28px] font-semibold leading-9 text-[#06222b] sm:text-[32px] sm:leading-10">
          Seguimiento de Curso
          {activity?.course.name ? `: ${activity.course.name}` : ""}
        </h1>
      </header>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon="users" label="Total estudiantes" tone="primary" value={summary?.totalStudents ?? "—"} />
        <SummaryCard icon="clipboard" label="Entregas recibidas" tone="cyan" value={summary?.received ?? "—"} />
        <SummaryCard icon="clock" label="Por calificar" tone="error" value={summary?.pendingQualification ?? "—"} />
        <SummaryCard icon="calendar" label="Pendientes de entrega" tone="neutral" value={summary?.pendingDelivery ?? "—"} />
      </section>

      <form className="academic-card p-5 sm:p-6" noValidate onSubmit={handleSearch}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="field-label text-[#1e3741]" htmlFor="course-select">
              Curso
            </label>
            <select
              className="field-control field-control-embedded mt-2 w-full"
              disabled={coursesLoading || courseList.length === 0}
              id="course-select"
              onChange={handleCourseChange}
              value={selectedCourse}
            >
              <option value="">
                {coursesLoading
                  ? "Cargando cursos…"
                  : courseList.length === 0
                    ? "No tienes cursos con actividades"
                    : "Selecciona un curso"}
              </option>
              {courseList.map((course) => (
                <option key={course.idCourse} value={course.idCourse}>
                  {course.name} ({course.code || course.idCourse})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label text-[#1e3741]" htmlFor="task-select">
              Actividad
            </label>
            <select
              className="field-control field-control-embedded mt-2 w-full"
              disabled={!selectedCourse}
              id="task-select"
              onChange={handleActivitySelect}
              value={activityCode}
            >
              <option value="">
                {selectedCourse
                  ? courseActivities.length === 0
                    ? "Este curso no tiene actividades"
                    : "Selecciona una actividad"
                  : "Primero selecciona un curso"}
              </option>
              {courseActivities.map((activity) => (
                <option key={activity.idTask} value={activity.code}>
                  {activity.name} — {activity.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="my-5 border-t border-[#e0e3e5]" />

        <label className="field-label text-[#1e3741]" htmlFor="activity-code">
          O escribe el identificador de la actividad
        </label>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9aa1a4]" name="search" />
            <input
              autoComplete="off"
              className="field-control field-control-embedded mt-0 h-13 uppercase"
              id="activity-code"
              onChange={(event) => setActivityCode(event.target.value)}
              placeholder="Ej: LAB-FIS-001"
              value={activityCode}
            />
          </div>
          <button className="primary-button min-w-36 px-6" disabled={status === "loading"} type="submit">
            {status === "loading" ? "Consultando…" : "Ver entregas"}
          </button>
        </div>
      </form>

      <section className="academic-card min-h-[400px] overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-[#e0e3e5] p-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="technical-label text-[#42484a]">Evaluación docente</p>
            <h2 className="evaluation-font-display mt-2 text-2xl font-semibold text-[#06222b]">
              Listado de Estudiantes y Calificaciones
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#42484a]">
              Vista general del progreso académico de los estudiantes inscritos en el curso.
            </p>
          </div>
          {activity && (
            <div className="shrink-0 text-left sm:text-right">
              <span className="inline-block rounded-full bg-[#f1f4f6] px-3 py-1 font-mono text-xs font-semibold text-[#1e3741]">
                {activity.code}
              </span>
              <p className="mt-2 text-sm font-medium text-[#06222b]">{activity.name}</p>
            </div>
          )}
        </div>

        {status === "loading" && <LoadingState label="Cargando estudiantes, entregas y calificaciones…" />}
        {status === "idle" && (
          <div className="grid min-h-64 place-items-center px-6 py-12 text-center">
            <div>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eaf1f4] text-[#00668a]">
                <Icon className="h-7 w-7" name="search" />
              </span>
              <p className="evaluation-font-display mt-4 text-xl font-semibold text-[#06222b]">
                Consulta una actividad
              </p>
              <p className="mt-2 text-sm leading-6 text-[#72787b]">
                Ingresa su código para cargar estudiantes, entregas y calificaciones.
              </p>
            </div>
          </div>
        )}
        {status === "error" && <ErrorState message={error} onRetry={() => loadFollowUp(activityCode)} />}
        {status === "success" && rows.length === 0 && (
          <div className="grid min-h-60 place-items-center px-6 py-12 text-center">
            <div>
              <p className="evaluation-font-display text-xl font-semibold text-[#06222b]">No hay estudiantes inscritos</p>
              <p className="mt-2 text-sm text-[#72787b]">Esta actividad pertenece a un curso sin matrículas activas.</p>
            </div>
          </div>
        )}

        {status === "success" && rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="academic-table min-w-[850px]">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Estado de actividad</th>
                  <th>Calificación</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.student.email}>
                    <td>
                      <div className="flex items-center gap-3">
                        {row.student.profilePicture ? (
                          <img alt="" className="h-9 w-9 rounded-full object-cover" src={row.student.profilePicture} />
                        ) : (
                          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#c4e7ff] font-mono text-xs font-semibold text-[#004d6a]">
                            {initials(row.student.name) || "ES"}
                          </span>
                        )}
                        <div>
                          <p className="font-medium text-[#06222b]">{row.student.name}</p>
                          <p className="mt-0.5 text-xs text-[#42484a]">ID: {row.student.institutionalCode}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={row.status} />
                      {row.hasDraft && row.status === "submitted" && (
                        <p className="mt-1.5 text-xs text-[#8a5a13]">Borrador guardado</p>
                      )}
                    </td>
                    <td>
                      {row.status === "qualified" && (
                        <span className="font-mono font-semibold text-[#06222b]">
                          {gradeLabel(row.qualification, activity.maxScore)}
                        </span>
                      )}
                      {row.status === "submitted" && <span className="italic text-[#42484a]">Pendiente</span>}
                      {row.status === "not_submitted" && <span className="text-[#42484a]">-</span>}
                    </td>
                    <td className="text-right">
                      {row.delivery ? (
                        <Link
                          className={row.status === "submitted" ? "primary-button min-h-0 px-4 py-2 text-sm" : "ghost-button font-mono text-sm"}
                          to={`/evaluacion/docente/actividades/${activity.idTask}/entregas/${encodeURIComponent(row.student.email)}?activityCode=${encodeURIComponent(activity.code)}`}
                        >
                          {row.status === "submitted" ? "Calificar" : "Ver detalle"}
                        </Link>
                      ) : (
                        <button
                          className="ghost-button cursor-not-allowed font-mono text-sm text-[#72787b] opacity-70"
                          disabled
                          title="Las notificaciones todavía no están habilitadas"
                          type="button"
                        >
                          Notificar
                        </button>
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
  );
}

function SummaryCard({ icon, label, tone, value }) {
  const tones = {
    primary: { card: "border-l-[#1e3741] bg-white", icon: "text-[#1e3741]", value: "text-[#06222b]" },
    cyan: { card: "border-l-[#00afeb] bg-white", icon: "text-[#00afeb]", value: "text-[#06222b]" },
    error: { card: "border-l-[#ba1a1a] bg-[#ffdad6]", icon: "text-[#ba1a1a]", value: "text-[#93000a]" },
    neutral: { card: "border-l-[#c2c7cb] bg-white", icon: "text-[#9aa1a4]", value: "text-[#06222b]" },
  };
  const style = tones[tone];

  return (
    <article className={`academic-card flex min-h-24 items-center gap-4 border-l-4 p-5 ${style.card}`}>
      <Icon className={`h-6 w-6 shrink-0 ${style.icon}`} name={icon} />
      <div>
        <p className="technical-label text-[11px] text-[#42484a]">{label}</p>
        <p className={`mt-1 font-mono text-2xl font-semibold ${style.value}`}>{value}</p>
      </div>
    </article>
  );
}
