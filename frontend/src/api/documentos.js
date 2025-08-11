import { apiFetch } from "./http";
const BASE = "/api/documentos";

export const getDocs = () =>
  apiFetch(`${BASE}`, { method: "GET" });

export const getDoc = (id) =>
  apiFetch(`${BASE}/${Number(id)}`, { method: "GET" });

export const createDoc = ({ nombre, tipo, archivo }) => {
  const form = new FormData();
  form.append("nombre", nombre);
  form.append("tipo", tipo);
  if (archivo) form.append("archivo", archivo);

  return apiFetch(`${BASE}`, {
    method: "POST",
    body: form,
    isForm: true,   
  });
};

export const updateDoc = (id, body) =>
  apiFetch(`${BASE}/${Number(id)}`, { method: "PUT", body });

export const deleteDoc = (id) =>
  apiFetch(`${BASE}/${Number(id)}`, { method: "DELETE" });
