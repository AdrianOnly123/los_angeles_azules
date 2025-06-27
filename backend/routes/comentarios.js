const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.post('/', (req, res) => {
  const { documento_id, usuario_id, texto } = req.body;

  if (!documento_id || !usuario_id || !texto) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  const permisoQuery = `
    SELECT puede_comentar FROM permisos
    WHERE documento_id = ? AND usuario_id = ?
  `;

  db.query(permisoQuery, [documento_id, usuario_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });

    if (results.length === 0 || results[0].puede_comentar !== 1) {
      return res.status(403).json({ error: 'No tienes permiso para comentar en este documento' });
    }

    const insertQuery = `
      INSERT INTO comentarios (documento_id, usuario_id, texto)
      VALUES (?, ?, ?)
    `;
    db.query(insertQuery, [documento_id, usuario_id, texto], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ mensaje: 'Comentario creado', id: result.insertId });
    });
  });
});



router.get('/', (req, res) => {
  const { documento_id } = req.query;

  if (!documento_id) {
    return res.status(400).json({ error: 'Falta el parámetro documento_id' });
  }

  const sql = `
    SELECT c.id, c.texto, c.fecha, u.nombre AS autor
    FROM comentarios c
    JOIN usuarios u ON c.usuario_id = u.id
    WHERE c.documento_id = ?
    ORDER BY c.fecha DESC
  `;

  db.query(sql, [documento_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { usuario_id, texto } = req.body;

  if (!usuario_id || !texto) {
    return res.status(400).json({ error: 'Faltan datos (usuario_id o texto)' });
  }

  // Verificar que el comentario exista y le pertenezca al usuario
  const checkQuery = 'SELECT * FROM comentarios WHERE id = ? AND usuario_id = ?';
  db.query(checkQuery, [id, usuario_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });

    if (results.length === 0) {
      return res.status(403).json({ error: 'No tienes permiso para editar este comentario' });
    }

    const updateQuery = 'UPDATE comentarios SET texto = ? WHERE id = ?';
    db.query(updateQuery, [texto, id], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ mensaje: 'Comentario actualizado correctamente' });
    });
  });
});


router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const { usuario_id } = req.body;

  if (!usuario_id) {
    return res.status(400).json({ error: 'Falta el usuario_id' });
  }

  const checkQuery = 'SELECT * FROM comentarios WHERE id = ? AND usuario_id = ?';
  db.query(checkQuery, [id, usuario_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });

    if (results.length === 0) {
      return res.status(403).json({ error: 'No permiso para eliminar comentario' });
    }

    const deleteQuery = 'DELETE FROM comentarios WHERE id = ?';
    db.query(deleteQuery, [id], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ mensaje: 'Comentario eliminado' });
    });
  });
});

module.exports = router;
