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
  return request(
    `/user-tasks/${taskId}/${encodeURIComponent(emailUser)}`,
  );
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

export function saveEvaluationDraft(taskId, emailUser, payload) {
  return request(`/user-tasks/${taskId}/${encodeURIComponent(emailUser)}/draft`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function getTeacherActivityCodes() {
  return request(`/user-tasks/follow-up-codes`);
}

export function getTeacherFollowUp(activityCode) {
  const params = new URLSearchParams({ activityCode });
  return request(`/user-tasks/follow-up?${params.toString()}`);
}
