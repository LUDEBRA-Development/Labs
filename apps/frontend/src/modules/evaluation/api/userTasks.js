import { request } from "./http";

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

export async function getDelivery(taskId, emailUser) {
  const params = new URLSearchParams({
    taskId: String(taskId),
    email: emailUser,
  });
  const deliveries = await request(`/user-tasks?${params.toString()}`);

  if (deliveries.length === 0) {
    throw new Error("No existe una entrega registrada para este estudiante");
  }

  if (deliveries.length > 1) {
    throw new Error(
      "La consulta devolvió más de una entrega para la misma clave",
    );
  }

  return deliveries[0];
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
