import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCourse, createCourse, updateCourse } from "../api/courses";
import { useEffect } from "react";

const initialForm = {
  idCourse: "",
  name: "",
  code: "",
  description: "",
};

function validate(form) {
  const errors = {};
  if (!form.idCourse.trim()) errors.idCourse = "El ID del curso es obligatorio";
  else if (form.idCourse.length > 8) errors.idCourse = "Máximo 8 caracteres";
  if (!form.name.trim()) errors.name = "El nombre es obligatorio";
  else if (form.name.length > 100) errors.name = "Máximo 100 caracteres";
  if (!form.code.trim()) errors.code = "El código es obligatorio";
  else if (form.code.length > 13) errors.code = "Máximo 13 caracteres";
  if (form.description.length > 500)
    errors.description = "Máximo 500 caracteres";
  return errors;
}

export default function CourseForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    getCourse(id)
      .then((course) => {
        setForm({
          idCourse: course.idCourse,
          name: course.name,
          code: course.code,
          description: course.description || "",
        });
      })
      .catch((err) => setServerError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (serverError) setServerError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError(null);
    setSuccess(null);

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        description: form.description.trim() || undefined,
      };

      if (isEdit) {
        await updateCourse(id, {
          name: payload.name,
          code: payload.code,
          description: payload.description,
        });
        setSuccess("Curso actualizado correctamente");
      } else {
        await createCourse(payload);
        setSuccess("Curso creado correctamente");
        setForm(initialForm);
        setErrors({});
      }

      setTimeout(() => {
        navigate("/admin/cursos");
      }, 1200);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-8 md:py-12">
      <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button
            onClick={() => navigate("/admin/cursos")}
            className="inline-flex items-center gap-2 text-primary font-label-md text-label-md mb-2 hover:text-secondary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>
            Volver a Cursos
          </button>
          <h2 className="font-headline-lg text-headline-lg text-primary">
            {isEdit ? "Editar Curso" : "Crear Nuevo Curso"}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-2xl">
            {isEdit
              ? "Modifique los detalles del curso existente."
              : "Configure los detalles del nuevo curso de laboratorio virtual."}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/cursos")}
            className="px-6 py-2.5 rounded-lg font-label-md text-label-md border-2 border-primary-container text-primary-container hover:bg-surface-container transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 rounded-lg font-label-md text-label-md bg-[#00AFEB] text-white hover:opacity-90 transition-opacity shadow-[0px_4px_20px_rgba(30,55,65,0.05)] disabled:opacity-50"
          >
            {submitting
              ? "Guardando..."
              : isEdit
                ? "Guardar Cambios"
                : "Crear Curso"}
          </button>
        </div>
      </div>

      {serverError && (
        <div className="mb-6 p-4 bg-state-error-container text-state-error rounded-lg font-body-md text-body-md flex items-center gap-2">
          <span className="material-symbols-outlined">error</span>
          {serverError}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-state-success-container text-state-success rounded-lg font-body-md text-body-md flex items-center gap-2">
          <span className="material-symbols-outlined">check_circle</span>
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-[0px_4px_20px_rgba(30,55,65,0.05)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-secondary-container" />
            <h3 className="font-headline-md text-headline-md text-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary-container">
                subject
              </span>
              Detalles del Curso
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {!isEdit && (
                  <div className="md:col-span-2 space-y-2">
                    <label
                      className="font-label-md text-label-md text-on-surface block"
                      htmlFor="idCourse"
                    >
                      ID del Curso
                    </label>
                    <input
                      id="idCourse"
                      name="idCourse"
                      type="text"
                      value={form.idCourse}
                      onChange={handleChange}
                      placeholder="ej. FIS101"
                      maxLength={8}
                      className={`w-full bg-surface-container-low border rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all placeholder:text-on-surface-variant/50 font-label-md ${
                        errors.idCourse
                          ? "border-state-error"
                          : "border-outline-variant"
                      }`}
                    />
                    {errors.idCourse && (
                      <p className="text-sm text-state-error">
                        {errors.idCourse}
                      </p>
                    )}
                  </div>
                )}

                <div className="md:col-span-2 space-y-2">
                  <label
                    className="font-label-md text-label-md text-on-surface block"
                    htmlFor="name"
                  >
                    Nombre del Curso
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="ej. Circuitos Eléctricos II"
                    maxLength={100}
                    className={`w-full bg-surface-container-low border rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all placeholder:text-on-surface-variant/50 ${
                      errors.name
                        ? "border-state-error"
                        : "border-outline-variant"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-sm text-state-error">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    className="font-label-md text-label-md text-on-surface block"
                    htmlFor="code"
                  >
                    Código del Curso
                  </label>
                  <input
                    id="code"
                    name="code"
                    type="text"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="ej. EL-204"
                    maxLength={13}
                    className={`w-full bg-surface-container-low border rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all placeholder:text-on-surface-variant/50 font-label-md ${
                      errors.code
                        ? "border-state-error"
                        : "border-outline-variant"
                    }`}
                  />
                  {errors.code && (
                    <p className="text-sm text-state-error">{errors.code}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    className="font-label-md text-label-md text-on-surface block"
                    htmlFor="description"
                  >
                    Descripción (Opcional)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Breve descripción de los objetivos del laboratorio..."
                    rows={3}
                    maxLength={500}
                    className={`w-full bg-surface-container-low border rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all placeholder:text-on-surface-variant/50 resize-none ${
                      errors.description
                        ? "border-state-error"
                        : "border-outline-variant"
                    }`}
                  />
                  <div className="flex justify-between">
                    {errors.description ? (
                      <p className="text-sm text-state-error">
                        {errors.description}
                      </p>
                    ) : (
                      <span />
                    )}
                    <span className="text-xs text-on-surface-variant">
                      {form.description.length}/500
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_4px_20px_rgba(30,55,65,0.05)] border border-outline-variant/30">
            <h3 className="font-headline-md text-[18px] leading-tight text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                info
              </span>
              Resumen
            </h3>
            <div className="space-y-3 font-body-md text-body-md">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">ID:</span>
                <span className="font-medium text-primary">
                  {isEdit ? id : form.idCourse || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Nombre:</span>
                <span className="font-medium text-primary truncate ml-4">
                  {form.name || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Código:</span>
                <span className="font-medium text-primary">
                  {form.code || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Descripción:</span>
                <span className="font-medium text-primary truncate ml-4">
                  {form.description ? "Sí" : "No"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
