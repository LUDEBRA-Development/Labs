import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { tasksApi } from "../api/tasksApi";
import { taskFilesApi } from "../api/taskFilesApi";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function fileIcon(fileType) {
  const type = (fileType || "").toLowerCase();
  if (type === "pdf") return "📄";
  if (type === "doc" || type === "docx") return "📝";
  if (type === "ppt" || type === "pptx") return "📊";
  if (type === "xls" || type === "xlsx") return "📈";
  return "📎";
}

export default function StudentTaskDetailPage() {
  const { idTask } = useParams();
  const [task, setTask] = useState(null);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    Promise.all([tasksApi.getById(idTask), taskFilesApi.getByTask(idTask)])
      .then(([taskData, filesData]) => {
        if (!active) return;
        setTask(taskData);
        setFiles(filesData || []);
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [idTask]);

  if (loading) return <p className="p-6 text-slate-400 text-sm">Cargando tarea...</p>;
  if (error) return <p className="p-6 text-red-500 text-sm">{error}</p>;
  if (!task) return null;

  const isExpired = task.Expiration_date && new Date(task.Expiration_date) < new Date();

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-bold text-slate-800">{task.Name}</h1>
          {isExpired && (
            <span className="text-xs font-medium bg-red-50 text-red-600 px-2 py-1 rounded-full">
              Vencida
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 mt-2 whitespace-pre-line">
          {task.Descriptions || "Sin descripción"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-slate-50 rounded-lg p-3">
          <span className="text-slate-400 block text-xs">Puntaje máximo</span>
          {task.Max_score}
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <span className="text-slate-400 block text-xs">Fecha de expiración</span>
          {task.Expiration_date
            ? new Date(task.Expiration_date).toLocaleString()
            : "Sin definir"}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">
          Material de la guía
        </h2>
        {files.length === 0 ? (
          <p className="text-sm text-slate-400">
            El docente no adjuntó material para esta tarea.
          </p>
        ) : (
          <div className="grid gap-2">
            {files.map((f) => {
              const fileHref = BASE_URL + (f.Url_file ?? f.urlFile);
              const fileKey = f.Id_task_file ?? f.idTaskFile;
              const fileLabel = f.File_name ?? f.fileName;
              const fileTypeLabel = f.File_type ?? f.fileType;
              return (
                <a
                  key={fileKey}
                  href={fileHref}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-4 py-3 hover:border-indigo-400 transition"
                >
                  <span className="text-lg">{fileIcon(fileTypeLabel)}</span>
                  <span className="text-sm font-medium text-slate-700 flex-1 truncate">
                    {fileLabel}
                  </span>
                  <span className="text-xs text-indigo-600 shrink-0">Descargar</span>
                </a>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">
          Simulador(es) habilitado(s)
        </h2>
        {!task.simulators || task.simulators.length === 0 ? (
          <p className="text-sm text-slate-400">
            El docente aún no ha habilitado un simulador para esta tarea.
          </p>
        ) : (
          <div className="grid gap-2">
            {task.simulators.map((sim) => (
              <a
                key={sim.Id_simulador}
                href={sim.Url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-3 hover:border-indigo-400 transition"
              >
                <span className="text-sm font-medium text-slate-700">{sim.Name}</span>
                <span className="text-xs text-indigo-600">Abrir simulador →</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
