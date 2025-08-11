const BASE = (
  (import.meta.env && import.meta.env.VITE_API) || "http://localhost:3305/api"
).replace(/\/+$/, "");

async function parseResponse(res) {
  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { /* no era JSON */ }
  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  return data;
}


export async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await parseResponse(res);
  return { token: data.token, user: data.user };
}

export async function register(nombre, email, password) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, email, password }),
  });
  return await parseResponse(res);
}

// útil para debug si vuelve a fallar
export function getApiBase() { return BASE; }
