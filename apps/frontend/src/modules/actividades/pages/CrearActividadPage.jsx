import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { tasksApi } from '../api/tasksApi';
import { taskFilesApi } from '../api/taskFilesApi';
import SimulatorMultiSelect from '../components/SimulatorMultiSelect';
import { createPeriod, getCourse, listPeriods } from '../../cursos/api/courses';
import { useAuth } from '../../../hooks/useAuth';

export default function DetalleActividadPage() {
  const { cursoId } = useParams();
  const { role } = useAuth();
  const [course, setCourse] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [form, setForm] = useState({
    name: '',
    descriptions: '',
    periodId: '',
    stateId: 2,
    expirationDate: '',
    maxScore: 5.0,
  });
  const [simulatorIds, setSimulatorIds] = useState([]);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (!cursoId) return;
    let active = true;
    getCourse(cursoId)
      .then((data) => { if (active) setCourse(data); })
      .catch(() => { if (active) setCourse(null); });
    listPeriods(cursoId)
      .then((data) => {
        if (!active) return;
        setPeriods(data);
        if (data.length > 0) {
          setForm((f) => ({ ...f, periodId: String(data[0].idPeriod) }));
        }
      })
      .catch(() => { if (active) setPeriods([]); });
    return () => { active = false };
  }, [cursoId]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      let periodId = Number(form.periodId);
      if (!periods.some((p) => p.idPeriod === periodId)) {
        const period = await createPeriod(cursoId, {
          name: `Periodo ${periods.length + 1}`,
        });
        periodId = period.idPeriod;
      }

      const createdTask = await tasksApi.create({
        ...form,
        periodId: Number(periodId),
        stateId: Number(form.stateId),
        maxScore: Number(form.maxScore),
        simulatorIds,
      });

      // La tarea ya existe (tiene Id_task) — ahora sí podemos subir el archivo
      if (file) {
        await taskFilesApi.upload(createdTask.Id_task ?? createdTask.idTask, file);
      }
      setSuccess('Actividad publicada correctamente. Los estudiantes del curso ya pueden verla.');
      setForm({
        name: '',
        descriptions: '',
        periodId: periods.some((p) => p.idPeriod === periodId) ? String(periodId) : '',
        stateId: 2,
        expirationDate: '',
        maxScore: 5.0,
      });
      setSimulatorIds([]);
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-sm text-slate-500">
        <Link to={role === 'admin' ? '/admin/cursos' : '/docente'} className="hover:text-sky-700">Página principal</Link>
        <span aria-hidden="true">›</span>
        <Link to={role === 'admin' ? '/admin/cursos' : '/docente'} className="hover:text-sky-700">Mis cursos</Link>
        {course?.name && (
          <>
            <span aria-hidden="true">›</span>
            <span className="font-medium text-slate-700">{course.name}</span>
          </>
        )}
        <span aria-hidden="true">›</span>
        <span aria-current="page" className="font-medium text-sky-700">Nueva Actividad</span>
      </nav>
      <h1 className="text-xl sm:text-2xl font-bold mb-6">Crear Nueva Actividad</h1>

      {success && (
        <div role="status" className="mb-6 rounded-md border border-green-300 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Información General</h2>

            <label className="block text-sm font-medium mb-1">Nombre de la Actividad *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ej. Titulación Ácido-Base"
              className="w-full border rounded-md px-3 py-2 mb-4"
              required
            />

            <label className="block text-sm font-medium mb-1">Descripción y Objetivos</label>
            <textarea
              name="descriptions"
              value={form.descriptions}
              onChange={handleChange}
              rows={4}
              placeholder="Describe los objetivos de aprendizaje..."
              className="w-full border rounded-md px-3 py-2"
            />
          </section>

          <section className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Simulador Asociado</h2>
            <SimulatorMultiSelect selectedIds={simulatorIds} onChange={setSimulatorIds} />
          </section>

          <section className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Material de la Guía (opcional)</h2>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              onChange={handleFileChange}
              className="block w-full text-sm border rounded-md px-3 py-2"
            />
            {file && (
              <p className="text-xs text-slate-500 mt-2">
                Seleccionado: {file.name} ({(file.size / 1024).toFixed(0)} KB)
              </p>
            )}
          </section>
        </div>

        <aside className="bg-white rounded-lg border p-6 h-fit space-y-4">
          <h2 className="text-lg font-semibold">Configuración</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Fecha Límite</label>
            <input
              type="datetime-local"
              name="expirationDate"
              value={form.expirationDate}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          {periods.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">Período</label>
              <select
                name="periodId"
                value={form.periodId}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              >
                {periods.map((period) => (
                  <option key={period.idPeriod} value={String(period.idPeriod)}>
                    {period.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Puntuación Máxima</label>
            <input
              type="number"
              step="0.01"
              name="maxScore"
              value={form.maxScore}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white rounded-md py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Publicando...' : 'Publicar Actividad'}
          </button>
        </aside>
      </form>
    </div>
  );
}