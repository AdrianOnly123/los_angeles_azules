// frontend/src/pages/DocumentoDetalle.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getDoc } from "../api/documentos";
import {
  getComentariosPorDocumento,
  crearComentario,
  eliminarComentario,
  actualizarComentario,
} from "../api/comentarios";

export default function DocumentoDetalle() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [texto, setTexto] = useState("");
  const [editando, setEditando] = useState(null);
  const [nuevoTexto, setNuevoTexto] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setErr("");
    setLoading(true);

    // 1) Cargar documento
    try {
      const dataDoc = await getDoc(id);
      setDoc(dataDoc);
    } catch (e) {
      setErr(e.message);
      setLoading(false);
      return; // si no hay doc, sí salimos
    }

    try {
      const dataComentarios = await getComentariosPorDocumento(id);
      setComentarios(Array.isArray(dataComentarios) ? dataComentarios : []);
    } catch (e) {
      console.warn("No se pudieron cargar comentarios:", e.message);
      setComentarios([]); // deja la lista vacía y sigue
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  async function handleComentar() {
    if (!texto.trim()) return;
    try {
      await crearComentario(id, texto);
      setTexto("");
      await loadData();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function handleEliminar(comentarioId) {
    if (!confirm("¿Eliminar este comentario?")) return;
    try {
      await eliminarComentario(comentarioId);
      await loadData();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function handleActualizar(comentarioId) {
    if (!nuevoTexto.trim()) return;
    try {
      await actualizarComentario(comentarioId, nuevoTexto);
      setEditando(null);
      setNuevoTexto("");
      await loadData();
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="page" style={{ maxWidth: 900 }}>
      <Link className="link-neon" to="/documentos">
        ← Volver
      </Link>

      {loading ? (
        <h1 className="h1">Cargando…</h1>
      ) : !doc ? (
        <h1 className="h1">Documento no encontrado</h1>
      ) : (
        <>
          <h1 className="h1">
            {doc.nombre} <span className="muted">({doc.tipo})</span>
          </h1>
          <div className="muted" style={{ marginBottom: 14 }}>
            Total de comentarios: {comentarios.length}
          </div>

          {err && <div className="error">{err}</div>}

          <div className="card-neon" style={{ marginBottom: 20 }}>
            <h2 className="h2">Comentarios</h2>
            {comentarios.length === 0 ? (
              <div className="muted">Aún no hay comentarios.</div>
            ) : (
              comentarios.map((c) => (
                <div key={c.id} className="comment">
                  <div className="author">{c.usuario}:</div>
                  {editando === c.id ? (
                    <>
                      <textarea
                        className="input-neon"
                        rows={2}
                        value={nuevoTexto}
                        onChange={(e) => setNuevoTexto(e.target.value)}
                      />
                      <div style={{ marginTop: 6 }}>
                        <button
                          className="btn-neon"
                          onClick={() => handleActualizar(c.id)}
                        >
                          Guardar
                        </button>
                        <button
                          className="btn-neon btn-danger"
                          onClick={() => {
                            setEditando(null);
                            setNuevoTexto("");
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>{c.texto}</div>
                      <div className="comment-actions">
                        <button
                          className="btn-neon btn-small"
                          onClick={() => {
                            setEditando(c.id);
                            setNuevoTexto(c.texto);
                          }}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-neon btn-danger btn-small"
                          onClick={() => handleEliminar(c.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="card-neon">
            <h2 className="h2">Agregar comentario</h2>
            <textarea
              className="input-neon"
              rows={3}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escribe un comentario…"
            />
            <div style={{ marginTop: 10 }}>
              <button
                className="btn-neon"
                onClick={handleComentar}
                disabled={!texto.trim()}
              >
                Comentar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
