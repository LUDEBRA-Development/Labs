import { useState } from 'react';
import { tasksApi } from '../api/tasksApi';
import { taskFilesApi } from '../api/taskFilesApi';
import SimulatorMultiSelect from '../components/SimulatorMultiSelect';

export default function CrearActividadPage() {
  const [form, setForm] = useState({
    name: '',
    descriptions: '',
    periodId: 1,
    stateId: 2,
    expirationDate: '',
    maxScore: 5.0,
  });
  const [simulatorIds, setSimulatorIds] = useState([]);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const createdTask = await tasksApi.create({
        ...form,
        periodId: Number(form.periodId),
        stateId: Number(form.stateId),
        maxScore: Number(form.maxScore),
        simulatorIds,
      });

      // La tarea ya existe (tiene Id_task) — ahora sí podemos subir el archivo
      if (file) {
        await taskFilesApi.upload(createdTask.Id_task ?? createdTask.idTask, file);
      }
      alert("Tarea creada correctamente" + (file ? " y archivo subido." : "."));
      // redirigir al listado, o mostrar confirmación
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Crear Nueva Actividad</h1>

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