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
    if (submitting) return; // evita doble submit
    if (!nombre.trim() || !archivo) {
      setErr("Faltan datos o archivo");
      return;
    }

    setErr("");
    setSubmitting(true);
    try {
      await createDoc({ nombre, tipo, archivo }); // POST
      // refresca desde backend para lista “real”
      await load();

      // limpia formulario
      setNombre("");
      setTipo("pdf");
      setArchivo(null);
      if (fileRef.current) fileRef.current.value = ""; // limpia <input type="file">
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
    <div style={{ maxWidth: 800, margin: "20px auto" }}>
      <h2>Documentos</h2>
      {err && <p style={{ color: "crimson" }}>{err}</p>}

      {loading ? <p>Cargando...</p> : (
        <ul>
          {docs.map(d => (
            <li key={d.id} style={{ marginBottom: 8 }}>
              <b>{d.nombre}</b> ({d.tipo}) · comentarios: {d.comentarios_count ?? d.conteo ?? 0}
              {" "}– <Link to={`/documentos/${d.id}`}>ver</Link>
              {" "} | <button onClick={() => handleDelete(d.id)}>eliminar</button>
            </li>
          ))}
        </ul>
      )}

      <hr />
      <h3>Subir nuevo</h3>
      <form onSubmit={handleCreate}>
        <input
          placeholder="Nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
        />
        <select value={tipo} onChange={e => setTipo(e.target.value)}>
          <option value="pdf">pdf</option>
        </select>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          onChange={e => setArchivo(e.target.files?.[0] || null)}
          required
        />
        <button type="submit" disabled={submitting || !archivo || !nombre.trim()}>
          {submitting ? "Creando..." : "Crear"}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        <button onClick={() => { localStorage.clear(); navigate("/login"); }}>
          Cerrar sesión
        </button>
      </p>
    </div>
  );
}