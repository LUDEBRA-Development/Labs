import { auth } from "../../../lib/firebase";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function request(path, options = {}) {
  const token = await auth.currentUser?.getIdToken();
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(!isFormData && { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
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

export function toApiAssetUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
