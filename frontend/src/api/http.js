// frontend/src/api/http.js
export const API =
  (import.meta.env.VITE_API_URL &&
    import.meta.env.VITE_API_URL.replace(/\/+$/, "")) ||
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
  let url = `${API}${cleanPath}`;

  // Cache-buster solo para GET
  if (method.toUpperCase() === "GET") {
    const sep = url.includes("?") ? "&" : "?";
    url = `${url}${sep}_=${Date.now()}`;
  }

  const finalHeaders = isForm
    ? authHeaders(headers) //  no seteamos Content-Type
    : authHeaders({ "Content-Type": "application/json", ...headers });

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
    cache: method.toUpperCase() === "GET" ? "no-store" : "no-cache",
  });

  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    
  }

  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}
