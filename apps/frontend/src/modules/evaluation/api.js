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

export function submitTask(taskId, payload) {
  return request(`/user-tasks/${taskId}/deliver`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getStudentHistory(emailUser) {
  return request(`/user-tasks/users/${encodeURIComponent(emailUser)}/history`);
}

export function getTaskDeliveries(taskId) {
  return request(`/user-tasks/tasks/${taskId}`);
}

export function gradeTask(taskId, emailUser, payload) {
  return request(
    `/user-tasks/${taskId}/users/${encodeURIComponent(emailUser)}/grade`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export function getTeacherNotifications(recipientEmail, onlyUnread = false) {
  const params = new URLSearchParams({
    recipientEmail,
    onlyUnread: String(onlyUnread),
  });
  return request(`/notifications?${params.toString()}`);
}

export function markNotificationAsRead(idNotification, recipientEmail) {
  return request(`/notifications/${idNotification}/read`, {
    method: "PATCH",
    body: JSON.stringify({ recipientEmail }),
  });
}
