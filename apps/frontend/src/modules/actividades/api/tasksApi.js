const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Error ${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export const tasksApi = {
  create: (dto) => request('/tasks', { method: 'POST', body: JSON.stringify(dto) }),
  findByPeriod: (periodId) => request(`/tasks?periodId=${periodId}`),
  findOne: (id) => request(`/tasks/${id}`),
  getById: (id) => request(`/tasks/${id}`), 
  update: (id, dto) => request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(dto) }),
  assignSimulators: (id, simulatorIds) =>
    request(`/tasks/${id}/simulators`, { method: 'POST', body: JSON.stringify({ simulatorIds }) }),
  removeSimulator: (id, simulatorId) =>
    request(`/tasks/${id}/simulators/${simulatorId}`, { method: 'DELETE' }),
  remove: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
};