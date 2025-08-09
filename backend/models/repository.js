// backend/models/repository.js
const db = require("./db");

/* ========================= Helper ========================= */

function q(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

/* ======================= Documentos ======================= */

async function crearDocumento({ nombre, tipo, creador_id, archivo }) {
  const sql =
    "INSERT INTO documentos (nombre, tipo, creador_id, archivo) VALUES (?, ?, ?, ?)";
  const res = await q(sql, [nombre, tipo, creador_id, archivo]);
  // Devuelve lo mínimo necesario; ajusta si quieres más campos
  return { id: res.insertId, nombre, tipo, creador_id, archivo };
}

async function obtenerDocumentoPorId(id) {
  const rows = await q(
    `
    SELECT d.*,
           (SELECT COUNT(*) FROM comentarios c WHERE c.documento_id = d.id) AS comentarios
    FROM documentos d
    WHERE d.id = ?
  `,
    [id]
  );
  return rows[0] || null;
}

async function listarDocumentosConConteo() {
  return q(
    `
    SELECT d.*,
           COALESCE(COUNT(c.id), 0) AS comentarios_count
    FROM documentos d
    LEFT JOIN comentarios c ON c.documento_id = d.id
    GROUP BY d.id
    ORDER BY d.id DESC
  `
  );
}

async function actualizarDocumento(id, { nombre, tipo }) {
  const r = await q("UPDATE documentos SET nombre = ?, tipo = ? WHERE id = ?", [
    nombre,
    tipo,
    id,
  ]);
  return r.affectedRows > 0;
}

async function eliminarDocumento(id) {
  const r = await q("DELETE FROM documentos WHERE id = ?", [id]);
  return r.affectedRows > 0;
}

async function esAutorDelDocumento(documento_id, usuario_id) {
  const rows = await q(
    "SELECT 1 FROM documentos WHERE id = ? AND creador_id = ? LIMIT 1",
    [documento_id, usuario_id]
  );
  return rows.length > 0;
}

/* ======================= Comentarios ====================== */

// Lista “bonita” para el detalle (con autor)
async function obtenerComentariosPorDocumento(documento_id) {
  const sql = `
    SELECT c.id,
           c.documento_id,
           c.usuario_id,
           u.nombre AS autor,
           c.texto,
           c.fecha
    FROM comentarios c
    JOIN usuarios u ON u.id = c.usuario_id
    WHERE c.documento_id = ?
    ORDER BY c.fecha DESC
  `;
  return q(sql, [documento_id]);
}

// (Opcional) Tu lista original, la dejamos por compatibilidad
async function listarComentariosPorDocumento(documento_id) {
  const sql = `
    SELECT c.id, c.documento_id, c.usuario_id, c.texto, c.fecha,
           u.nombre AS usuario_nombre, u.email AS usuario_email
    FROM comentarios c
    JOIN usuarios u ON u.id = c.usuario_id
    WHERE c.documento_id = ?
    ORDER BY c.fecha DESC
  `;
  return q(sql, [documento_id]);
}

async function crearComentario({ documento_id, usuario_id, texto }) {
  const ins = await q(
    "INSERT INTO comentarios (documento_id, usuario_id, texto, fecha) VALUES (?, ?, ?, NOW())",
    [documento_id, usuario_id, texto]
  );

  // Devuelve el comentario recién creado con JOIN a usuarios
  const [row] = await q(
    `
    SELECT c.id,
           c.documento_id,
           c.usuario_id,
           u.nombre AS autor,
           c.texto,
           c.fecha
    FROM comentarios c
    JOIN usuarios u ON u.id = c.usuario_id
    WHERE c.id = ?
  `,
    [ins.insertId]
  );
  return row;
}

async function actualizarComentario(id, { texto }) {
  await q("UPDATE comentarios SET texto = ? WHERE id = ?", [texto, id]);
  const [row] = await q(
    `
    SELECT c.id,
           c.documento_id,
           c.usuario_id,
           u.nombre AS autor,
           c.texto,
           c.fecha
    FROM comentarios c
    JOIN usuarios u ON u.id = c.usuario_id
    WHERE c.id = ?
  `,
    [id]
  );
  return row;
}

async function eliminarComentario(id) {
  const r = await q("DELETE FROM comentarios WHERE id = ?", [id]);
  return r.affectedRows > 0;
}

/* ================== Permisos / Autoría ==================== */

async function tienePermisoParaComentar(documento_id, usuario_id) {
  const rows = await q(
    "SELECT puede_comentar FROM permisos WHERE documento_id = ? AND usuario_id = ?",
    [documento_id, usuario_id]
  );
  return rows.length > 0 && Number(rows[0].puede_comentar) === 1;
}

async function esAutorDelComentario(comentario_id, usuario_id) {
  const rows = await q(
    "SELECT 1 FROM comentarios WHERE id = ? AND usuario_id = ? LIMIT 1",
    [comentario_id, usuario_id]
  );
  return rows.length > 0;
}

/* ========================= Exports ======================== */

module.exports = {
  q,
  // Documentos
  crearDocumento,
  listarDocumentosConConteo,
  obtenerDocumentoPorId,
  actualizarDocumento,
  eliminarDocumento,
  esAutorDelDocumento,
  // Comentarios
  obtenerComentariosPorDocumento, // <--- la que te faltaba
  listarComentariosPorDocumento,
  crearComentario,
  actualizarComentario,
  eliminarComentario,
  // Permisos / autoría
  tienePermisoParaComentar,
  esAutorDelComentario,
};
