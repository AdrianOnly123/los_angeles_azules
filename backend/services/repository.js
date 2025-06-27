const db = require('../models/db');

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

module.exports = {
  crearDocumento
};