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
  const { id } = useParams();                 // <-- hook solo al tope
  const [doc, setDoc] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [texto, setTexto] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // Cargar doc + comentarios
  useEffect(() => {
    let alive = true;
    async function load() {
      setErr("");
      setLoading(true);
      try {
        const [d, cs] = await Promise.all([
          getDoc(id),
          getComentariosPorDocumento(id),
        ]);
        if (!alive) return;
        setDoc(d);
        setComentarios(cs);
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Error al cargar");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [id]);

  async function handleCrear(e) {
    e.preventDefault();
    setErr("");
    if (!texto.trim()) return;
    try {
      await crearComentario({ documento_id: Number(id), texto });
      setTexto("");
      const cs = await getComentariosPorDocumento(id);
      setComentarios(cs);
    } catch (e) {
      setErr(e.message);
    }
  }

  if (loading) return <div style={{ padding: 16 }}>Cargando...</div>;

  return (
    <div style={{ padding: 16 }}>
      <Link to="/documentos">← Volver</Link>
      <h2 style={{ marginTop: 8 }}>{doc?.nombre} ({doc?.tipo})</h2>

      <p>Total de comentarios: <b>{comentarios.length}</b></p>
      {err && <p style={{ color: "crimson" }}>{err}</p>}

      <h3>Comentarios</h3>
      {comentarios.length === 0 && <p>No hay comentarios.</p>}

      <ul>
        {comentarios.map(c => (
          <li key={c.id}>
            <b>{c.autor || c.usuario_id}:</b> {c.texto}
          </li>
        ))}
      </ul>

      <form onSubmit={handleCrear} style={{ marginTop: 12 }}>
        <textarea
          value={texto}
          onChange={e => setTexto(e.target.value)}
          rows={3}
          style={{ width: 320 }}
          placeholder="Escribe un comentario..."
        />
        <div>
          <button type="submit">Comentar</button>
        </div>
      </form>
    </div>
  );
}
