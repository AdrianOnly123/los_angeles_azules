import { apiFetch } from "./http";
const BASE = "/api/documentos";

export const getDocs = () => apiFetch(`${BASE}`);
export const getDoc = (id) => apiFetch(`${BASE}/${id}`);


export const createDoc = async ({ nombre, tipo, archivo }) => {
  const token = localStorage.getItem("token");
  const form = new FormData();
  form.append("nombre", nombre);
  form.append("tipo", tipo);
  form.append("archivo", archivo);

  const res = await fetch(`${import.meta.env.VITE_API_URL}${BASE}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }, // sin Content-Type
    body: form,
    cache: "no-store"
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error creando documento");
  return data; // { mensaje, id }
};

export const updateDoc = (id, body) =>
  apiFetch(`${BASE}/${id}`, { method: "PUT", body: JSON.stringify(body) });

export const deleteDoc = (id) =>
  apiFetch(`${BASE}/${id}`, { method: "DELETE" });
