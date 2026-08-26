const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = Array.isArray(payload?.message)
      ? payload.message.join(", ")
      : payload?.message;
    throw new Error(message || "No fue posible completar la solicitud");
  }

  if (response.status === 204) return null;
  return response.json();
}

export function submitTask(payload) {
  return request("/user-tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getStudentHistory(emailUser) {
  const params = new URLSearchParams({ email: emailUser });
  return request(`/user-tasks?${params.toString()}`);
}

export function getTaskDeliveries(taskId) {
  const params = new URLSearchParams({ taskId: String(taskId) });
  return request(`/user-tasks?${params.toString()}`);
}

export function qualifyTask(taskId, emailUser, payload) {
  return request(
    `/user-tasks/${taskId}/${encodeURIComponent(emailUser)}/qualification`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}
