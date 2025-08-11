import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getDocs, createDoc, deleteDoc } from "../api/documentos";

export default function Documentos() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("pdf");
  const [archivo, setArchivo] = useState(null);
  const fileRef = useRef(null);
  const navigate = useNavigate();

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const data = await getDocs();
      setDocs(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (submitting) return;
    if (!nombre.trim() || !archivo) {
      setErr("Faltan datos o archivo");
      return;
    }

    setErr("");
    setSubmitting(true);
    try {
      await createDoc({ nombre, tipo, archivo }); // POST
      await load(); // refresca
      // limpia formulario
      setNombre("");
      setTipo("pdf");
      setArchivo(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (e) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("¿Eliminar documento?")) return;
    try {
      await deleteDoc(id);
      await load();
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="page" style={{ maxWidth: 900 }}>
      <h1 className="h1">Documentos</h1>
      {err && <div className="error">{err}</div>}

      {/* Lista */}
      <div className="card-neon" style={{ marginBottom: 20 }}>
        {loading ? (
          <div className="muted">Cargando…</div>
        ) : docs.length === 0 ? (
          <div className="muted">Aún no hay documentos.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {docs.map((d) => (
              <div key={d.id} className="doc-item">
                <div>
                  <div className="doc-name">{d.nombre}</div>
                  <div className="muted">ID #{d.id}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className="pill pill--type">{(d.tipo || "").toUpperCase()}</span>
                  <span className="pill pill--count">
                    comentarios: {d.comentarios_count ?? d.conteo ?? 0}
                  </span>
                  <Link className="btn-neon" to={`/documentos/${d.id}`}>ver</Link>
                  <button className="btn-neon btn-danger" onClick={() => handleDelete(d.id)}>
                    eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Crear */}
      <div className="card-neon">
        <h2 className="h2">Subir nuevo</h2>
        <form onSubmit={handleCreate}>
          <div className="form-row">
            <label>Nombre</label>
            <input
              className="input-neon"
              placeholder="Nombre del documento"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <label>Tipo</label>
            <select
              className="input-neon"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              <option value="pdf">pdf</option>
              {/* deja solo pdf como lo tienes ahora */}
            </select>
          </div>

          <div className="form-row">
            <label>Archivo</label>
            <input
              ref={fileRef}
              className="input-neon"
              type="file"
              accept="application/pdf"
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-neon"
            disabled={submitting || !archivo || !nombre.trim()}
          >
            {submitting ? "Creando..." : "Crear"}
          </button>
        </form>

        <p className="muted" style={{ marginTop: 12 }}>
          <button
            className="btn-neon btn-danger"
            onClick={() => { localStorage.clear(); navigate("/login"); }}
            type="button"
          >
            Cerrar sesión
          </button>
        </p>
      </div>
    </div>
  );
}
