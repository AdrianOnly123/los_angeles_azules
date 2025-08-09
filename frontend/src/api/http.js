// frontend/src/api/http.js
export const API =
  (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.replace(/\/+$/, "")) ||
  "http://localhost:3305";

function authHeaders(extra = {}) {
  const token = localStorage.getItem("token");
  return { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...extra };
}

export async function apiFetch(
  path,
  { method = "GET", headers = {}, body, isForm = false } = {}
) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const isGet = method.toUpperCase() === "GET";

  let url = `${API}${cleanPath}`;
  if (isGet) {
    const sep = url.includes("?") ? "&" : "?";
    url = `${url}${sep}t=${Date.now()}`; // cache-buster SOLO en GET
  }

  const finalHeaders = isForm
    ? authHeaders(headers) // FormData no lleva Content-Type manual
    : authHeaders({ "Content-Type": "application/json", ...headers });

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
    cache: isGet ? "no-store" : "no-cache",
  });

  if (!res.ok) {
    let err; try { err = await res.json(); } catch { err = { error: res.statusText }; }
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}
