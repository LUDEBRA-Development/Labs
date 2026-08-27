const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const taskFilesApi = {
  upload: async (idTask, file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BASE_URL}/tasks/${idTask}/files`, {
      method: "POST",
      body: formData, // OJO: no pongas Content-Type manual, el navegador
                       // arma el boundary correcto solo si lo dejas así
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `Error ${res.status} al subir archivo`);
    }
    return res.json();
  },

  getByTask: async (idTask) => {
    const res = await fetch(`${BASE_URL}/tasks/${idTask}/files`);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
  },

  remove: async (idTaskFile) => {
    const res = await fetch(`${BASE_URL}/task-files/${idTaskFile}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
  },
};