export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function request(path, options = {}) {
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
