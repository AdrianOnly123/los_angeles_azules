// controllers/comentarioController.js
const {
  crearComentario,
  listarComentarios,
  actualizarComentario,
  eliminarComentario
} = require('../models/repository');
const db = require('../models/db');

async function create(req, res) {
  const { documento_id, usuario_id, texto } = req.body;
  if (documento_id == null || usuario_id == null || !texto) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  //pasar a service

  //pasar a models en un repository
  db.query(
    'SELECT puede_comentar FROM permisos WHERE documento_id = ? AND usuario_id = ?',
    [documento_id, usuario_id],
    async (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      if (!rows.length || rows[0].puede_comentar !== 1) {
        return res.status(403).json({ error: 'Sin permiso' });
      }
      try {
        const id = await crearComentario({ documento_id, usuario_id, texto });
        res.json({ mensaje: 'Comentario creado', id });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    }
  );
}

async function list(req, res) {
  const { documento_id } = req.query;
  if (!documento_id) {
    return res.status(400).json({ error: 'Falta documento_id' });
  }
  try {
    const comments = await listarComentarios(documento_id);
    res.json(comments);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function update(req, res) {
  const { id } = req.params;
  const { usuario_id, texto } = req.body;
  if (!usuario_id || !texto) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  db.query(
    'SELECT * FROM comentarios WHERE id = ? AND usuario_id = ?',
    [id, usuario_id],
    async (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      if (!rows.length) return res.status(403).json({ error: 'Sin permiso' });
      try {
        await actualizarComentario(id, texto);
        res.json({ mensaje: 'Comentario actualizado' });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    }
  );
}

async function remove(req, res) {
  const { id } = req.params;
  const { usuario_id } = req.body;
  if (!usuario_id) return res.status(400).json({ error: 'Falta usuario_id' });
  db.query(
    'SELECT * FROM comentarios WHERE id = ? AND usuario_id = ?',
    [id, usuario_id],
    async (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      if (!rows.length) return res.status(403).json({ error: 'Sin permiso' });
      try {
        await eliminarComentario(id);
        res.json({ mensaje: 'Comentario eliminado' });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    }
  );
}

module.exports = { create, list, update, remove };
