
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!response.ok) throw new Error(`Error ${response.status}`);
  if (response.status === 204) return null;
  return response.json();
}

export const simulatorsApi = {
  findAll: (onlyActive = true) => request(`/simulators?onlyActive=${onlyActive}`),
};