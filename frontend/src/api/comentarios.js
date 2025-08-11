
import { apiFetch } from "./http";

export function getComentariosPorDocumento(documentoId) {
  // GET /api/comentarios/:documento_id
  return apiFetch(`/api/comentarios/${Number(documentoId)}`, { method: "GET" });
}

export function crearComentario(documentoId, texto) {
  // POST /api/comentarios  { documento_id, texto }
  return apiFetch(`/api/comentarios`, {
    method: "POST",
    body: { documento_id: Number(documentoId), texto },
  });
}

export function actualizarComentario(id, texto) {
  // PUT /api/comentarios/:id
  return apiFetch(`/api/comentarios/${Number(id)}`, {
    method: "PUT",
    body: { texto },
  });
}

export function eliminarComentario(id) {
  // DELETE /api/comentarios/:id
  return apiFetch(`/api/comentarios/${Number(id)}`, { method: "DELETE" });
}
