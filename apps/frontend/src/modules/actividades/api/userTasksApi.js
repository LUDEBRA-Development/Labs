import { auth } from '../../../lib/firebase';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(path, options = {}) {
  const token = await auth.currentUser?.getIdToken();
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Error ${response.status}`);
  }
  return response.json();
}

export const userTasksApi = {
  submit: (idTask, emailUser, file, comment) => {
    const formData = new FormData();
    formData.append('idTask', String(idTask));
    formData.append('emailUser', emailUser);
    if (comment.trim()) formData.append('comment', comment.trim());
    formData.append('file', file);
    return request('/user-tasks/submit', { method: 'POST', body: formData });
  },
  findByStudent: (email) => request(`/user-tasks?email=${encodeURIComponent(email)}`),
};
