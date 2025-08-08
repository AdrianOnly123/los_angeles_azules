const db = require("./db");

const q = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });

// Función que guarda un documento en la base de datos
function crearDocumento({ nombre, tipo, creador_id, archivo }) {
  return new Promise((resolve, reject) => {
    const query =
      "INSERT INTO documentos (nombre, tipo, creador_id, archivo) VALUES (?, ?, ?, ?)";
    db.query(query, [nombre, tipo, creador_id, archivo], (err, result) => {
      if (err) return reject(err);
      resolve({ id: result.insertId, archivo });
    });
  });
}

// Obtener por id (con conteo)
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

// Listar con conteo de comentarios
async function listarDocumentosConConteo() {
  return q(`
    SELECT d.*,
      (SELECT COUNT(*) FROM comentarios c WHERE c.documento_id = d.id) AS comentarios
    FROM documentos d
    ORDER BY d.id DESC
  `);
}

// Actualizar
async function actualizarDocumento(id, { nombre, tipo }) {
  const r = await q("UPDATE documentos SET nombre = ?, tipo = ? WHERE id = ?", [
    nombre,
    tipo,
    id,
  ]);
  return r.affectedRows > 0;
}

async function esAutorDelDocumento(documento_id, usuario_id) {
  const rows = await q(
    'SELECT 1 FROM documentos WHERE id = ? AND creador_id = ? LIMIT 1',
    [documento_id, usuario_id]
  );
  return rows.length > 0;
}


// Eliminar (lanzará errno 1451 si hay FKs)
async function eliminarDocumento(id) {
  try {
    const r = await q("DELETE FROM documentos WHERE id = ?", [id]);
    return r.affectedRows > 0;
  } catch (e) {
    throw e;
  }
}

// Función que guarda un comentario en la base de datos
function crearComentario({ documento_id, usuario_id, texto }) {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO comentarios (documento_id, usuario_id, texto) VALUES (?, ?, ?)",
      [documento_id, usuario_id, texto],
      (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      }
    );
  });
}

// Listar comentarios por documento
async function listarComentariosPorDocumento(documento_id) {
  return q(
    `
    SELECT c.id, c.documento_id, c.usuario_id, c.texto, c.fecha,
           u.nombre AS usuario_nombre, u.email AS usuario_email
    FROM comentarios c
    JOIN usuarios u ON u.id = c.usuario_id
    WHERE c.documento_id = ?
    ORDER BY c.fecha DESC
  `,
    [documento_id]
  );
}

// Actualizar comentario
async function actualizarComentario(id, { texto }) {
  const r = await q("UPDATE comentarios SET texto = ? WHERE id = ?", [
    texto,
    id,
  ]);
  return r.affectedRows > 0;
}

// Eliminar comentario
async function eliminarComentario(id) {
  const r = await q("DELETE FROM comentarios WHERE id = ?", [id]);
  return r.affectedRows > 0;
}

module.exports = {
  // documentos
  crearDocumento,
  listarDocumentosConConteo,
  obtenerDocumentoPorId,
  actualizarDocumento,
  esAutorDelDocumento,
  eliminarDocumento,
  // comentarios
  crearComentario,
  listarComentariosPorDocumento,
  actualizarComentario,
  eliminarComentario,
};
