console.log('Cargando rutas de documentos');

const express = require('express');
const router = express.Router();
const db = require('../models/db');
const verifyToken = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const { crearDocumento } = require('../services/repository');

router.get('/', (req, res) => {
  const sql = `
    SELECT d.id, d.nombre, d.tipo, COUNT(c.id) AS comentarios
    FROM documentos d
    LEFT JOIN comentarios c ON d.id = c.documento_id
    GROUP BY d.id, d.nombre, d.tipo
    ORDER BY d.id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

router.post('/', upload.single('archivo'), async (req, res) => {
  const archivo = req.file;
  const { nombre, tipo, creador_id } = req.body;

  if (!nombre || !tipo || !creador_id || !archivo) {
    return res.status(400).json({ error: 'Faltan datos o archivo' });
  }

  try {
    const resultado = await crearDocumento({
      nombre,
      tipo,
      creador_id,
      archivo: archivo.path
    });

    res.json({ mensaje: 'Documento creado', ...resultado });
  } catch (error) {
    res.status(500).json({ error });
  }
});


router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, tipo } = req.body;

  if (!nombre || !tipo) {
    return res.status(400).json({ error: 'Faltan datos (nombre o tipo)' });
  }

  const sql = `
    UPDATE documentos
    SET nombre = ?, tipo = ?
    WHERE id = ?
  `;

  db.query(sql, [nombre, tipo, id], (err, result) => {
    if (err) return res.status(500).json({ error: err });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    res.json({ mensaje: 'Documento actualizado correctamente' });
  });
});


router.delete('/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const usuario_id = req.user.id;

  // PARA VERIFICAR SI ES
  const checkQuery = 'SELECT * FROM documentos WHERE id = ? AND creador_id = ?';

  db.query(checkQuery, [id, usuario_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });

    if (results.length === 0) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este documento' });
    }
    // SI SI ES LO ELIMINA
    const deleteQuery = 'DELETE FROM documentos WHERE id = ?';

    db.query(deleteQuery, [id], (err, result) => {
      if (err) {
        if (err.errno === 1451) {
          return res.status(409).json({ error: 'No se puede eliminar: tiene comentarios o permisos asociados' });
        }
        return res.status(500).json({ error: err });
      }

      res.json({ mensaje: 'Documento eliminado correctamente' });
    });
  });
});


module.exports = router;

