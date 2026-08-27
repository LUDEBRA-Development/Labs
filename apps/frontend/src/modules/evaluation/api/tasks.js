import { request } from "./http";

export function getTasksByCourse(idCourse) {
  const params = new URLSearchParams({ courseId: idCourse });
  return request(`/tasks?${params.toString()}`);
}

export function getTaskById(idTask) {
  return request(`/tasks/${idTask}`);
}
