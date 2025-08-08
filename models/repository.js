const db = require('./db');

// Función que guarda un documento en la base de datos
function crearDocumento({ nombre, tipo, creador_id, archivo }) {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO documentos (nombre, tipo, creador_id, archivo) VALUES (?, ?, ?, ?)';
    db.query(query, [nombre, tipo, creador_id, archivo], (err, result) => {
      if (err) return reject(err);
      resolve({ id: result.insertId, archivo });
    });
  });
}

// Función que guarda un comentario en la base de datos
function crearComentario({ documento_id, usuario_id, texto }) {
  return new Promise((resolve, reject) => {
    db.query(
      'INSERT INTO comentarios (documento_id, usuario_id, texto) VALUES (?, ?, ?)',
      [documento_id, usuario_id, texto],
      (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      }
    );
  });
}

// Exportar todas las funciones juntas
module.exports = {
  crearDocumento,
  crearComentario,
  // aquí puedes agregar más funciones como listar, eliminar, etc.
};
