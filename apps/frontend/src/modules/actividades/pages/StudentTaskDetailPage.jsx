import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { tasksApi } from '../api/tasksApi';
import { taskFilesApi } from '../api/taskFilesApi';
import { userTasksApi } from '../api/userTasksApi';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx'];

function fileIcon(fileType) {
  const type = (fileType || '').toLowerCase();
  if (type === 'pdf') return '📄';
  if (type === 'doc' || type === 'docx') return '📝';
  return '📎';
}

function formatDate(date) {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'full', timeStyle: 'short',
  }).format(new Date(date));
}

function extensionOf(file) {
  return file?.name.split('.').pop()?.toLowerCase() || '';
}

export default function StudentTaskDetailPage() {
  const { idTask } = useParams();
  const navigate = useNavigate();
  const { profile, firebaseUser } = useAuth();
  const studentEmail = "estudiante@ejemplo.com";
  //const studentEmail = profile?.email || firebaseUser?.email;
  const inputRef = useRef(null);
  const [task, setTask] = useState(null);
  const [files, setFiles] = useState([]);
  const [delivery, setDelivery] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submissionNotice, setSubmissionNotice] = useState(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    const requests = [tasksApi.getById(idTask), taskFilesApi.getByTask(idTask)];
    if (studentEmail) requests.push(userTasksApi.findByStudent(studentEmail));

    Promise.all(requests)
      .then(([taskData, filesData, deliveries = []]) => {
        if (!active) return;
        setTask(taskData);
        setFiles(filesData || []);
        setDelivery(deliveries.find((item) => Number(item.idTask) === Number(idTask)) || null);
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, [idTask, studentEmail]);

  const isExpired = Boolean(task?.expirationDate && new Date(task.expirationDate) < new Date());
  const isDelivered = Boolean(delivery?.deliveryDate);

  const selectFile = (file) => {
    setFileError(null);
    if (!file) return;
    if (!ALLOWED_EXTENSIONS.includes(extensionOf(file))) {
      setFileError('Selecciona un archivo PDF, DOC o DOCX.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError('El archivo no puede superar los 50 MB.');
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setSubmissionNotice({ type: 'error', message: 'Selecciona un archivo antes de entregar la actividad.' });
      return;
    }
    if (!studentEmail) {
      setSubmissionNotice({ type: 'error', message: 'No fue posible identificar tu correo. Cierra sesión e ingresa nuevamente.' });
      return;
    }
    if (isExpired) {
      setSubmissionNotice({ type: 'error', message: 'La fecha límite ya venció; la actividad no puede enviarse.' });
      return;
    }
    if (isDelivered) {
      setSubmissionNotice({ type: 'error', message: 'Esta actividad ya fue entregada.' });
      return;
    }
    setSubmitting(true);
    setError(null);
    setSubmissionNotice({ type: 'loading', message: 'Guardando tu entrega...' });
    try {
      const result = await userTasksApi.submit(idTask, studentEmail, selectedFile, comment);
      setDelivery(result);
      setSelectedFile(null);
      setComment('');
      setSubmissionNotice({
        type: 'success',
        message: '¡Entrega registrada correctamente! Ya puedes verla como entregada.',
      });
    } catch (err) {
      const message = err.message || 'No fue posible entregar la actividad.';
      setError(message);
      setSubmissionNotice({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-6 text-sm text-slate-400">Cargando tarea...</p>;
  if (!task) return <p className="p-6 text-sm text-red-500">{error || 'Tarea no encontrada.'}</p>;

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6">
      <button onClick={() => navigate(-1)} className="text-sm text-sky-700 hover:underline">← Volver a mis actividades</button>
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</div>}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{task.name}</h1>
            <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">{task.descriptions || 'Esta actividad no tiene descripción.'}</p>

            <div className="mt-6">
              <h2 className="font-semibold text-slate-800">Material de apoyo</h2>
              {files.length === 0 ? <p className="mt-2 text-sm text-slate-400">El docente no adjuntó material para esta tarea.</p> : (
                <div className="mt-3 grid gap-2">
                  {files.map((file) => {
                    const fileHref = BASE_URL + (file.Url_file ?? file.urlFile);
                    const fileKey = file.Id_task_file ?? file.idTaskFile;
                    const fileName = file.File_name ?? file.fileName;
                    const fileType = file.File_type ?? file.fileType;
                    return <a key={fileKey} href={fileHref} target="_blank" rel="noreferrer" download className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-sky-400">
                      <span className="text-lg">{fileIcon(fileType)}</span><span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">{fileName}</span><span className="text-xs font-medium text-sky-700">Descargar</span>
                    </a>;
                  })}
                </div>
              )}
            </div>

            {task.simulators?.length > 0 && <div className="mt-6">
              <h2 className="font-semibold text-slate-800">Simuladores habilitados</h2>
              <div className="mt-3 grid gap-2">{task.simulators.map((simulator) => <a key={simulator.idSimulador} href={simulator.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:border-sky-400">{simulator.name}<span className="text-sky-700">Abrir →</span></a>)}</div>
            </div>}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-lg font-bold text-slate-900">Entregar informe</h2>
            {submissionNotice && <div role="status" className={`mt-4 rounded-lg border px-4 py-3 text-sm ${submissionNotice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : submissionNotice.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-sky-200 bg-sky-50 text-sky-800'}`}>{submissionNotice.message}</div>}
            {isDelivered ? <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><p className="font-semibold">Actividad entregada</p><p className="mt-1">Enviada el {formatDate(delivery.deliveryDate)}.</p></div>
              : isExpired ? <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">El plazo de entrega ya finalizó.</p>
                : <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <button type="button" onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); selectFile(event.dataTransfer.files[0]); }} className={`flex min-h-44 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed px-5 text-center transition ${dragging ? 'border-sky-500 bg-sky-50' : 'border-slate-300 bg-slate-50 hover:border-sky-400'}`}>
                    <span className="mb-3 text-3xl">⇧</span><span className="text-sm font-medium text-slate-700">Arrastra y suelta tu archivo aquí</span><span className="mt-1 text-xs text-slate-500">o haz clic para buscar en tu dispositivo</span><span className="mt-3 text-xs text-slate-400">PDF, DOCX · Máx. 50 MB</span>
                  </button>
                  <input ref={inputRef} type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={(event) => selectFile(event.target.files?.[0])} />
                  {selectedFile && <div className="flex items-center gap-3 rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-700"><span>{fileIcon(extensionOf(selectedFile))}</span><span className="min-w-0 flex-1 truncate font-medium">{selectedFile.name}</span><button type="button" onClick={() => { setSelectedFile(null); inputRef.current.value = ''; }} className="text-red-600 hover:underline">Quitar</button></div>}
                  {fileError && <p className="text-sm text-red-600">{fileError}</p>}
                  <label className="block text-sm font-medium text-slate-700">Comentario para el docente <span className="font-normal text-slate-400">(opcional)</span><textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={500} rows={3} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" placeholder="Añade una nota sobre tu entrega..." /></label>
                  <div className="flex justify-end gap-3 border-t border-slate-100 pt-4"><button type="button" onClick={() => navigate(-1)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancelar</button><button type="submit" disabled={submitting} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50">{submitting ? 'Entregando...' : 'Entregar actividad →'}</button></div>
                </form>}
          </section>
        </div>

        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-900">Detalles de la tarea</h2>
          <dl className="mt-4 space-y-4 border-t border-slate-100 pt-4 text-sm">
            <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Estado de entrega</dt><dd className={`mt-1 font-semibold ${isDelivered ? 'text-emerald-600' : isExpired ? 'text-red-600' : 'text-amber-600'}`}>{isDelivered ? '● Entregada' : isExpired ? '● Vencida' : '● Pendiente'}</dd></div>
            <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Fecha límite</dt><dd className="mt-1 text-slate-700">{task.expirationDate ? formatDate(task.expirationDate) : 'Sin fecha límite'}</dd></div>
            <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Puntuación máxima</dt><dd className="mt-1 font-semibold text-slate-700">{task.maxScore} puntos</dd></div>
            {delivery?.qualification !== null && delivery?.qualification !== undefined && <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Calificación</dt><dd className="mt-1 font-semibold text-sky-700">{delivery.qualification} / {task.maxScore}</dd></div>}
          </dl>
        </aside>
      </div>
    </div>
  );
}
