const router = require('express').Router();
const comentarioController = require('./comentarioController');
const { verifyToken } = require('./middlewares/auth');
const comentarios = require("../controllers/comentarioController");
const { checkPermisoComentar, checkAutorComentario } = require('./middlewares/permisos');
const repo = require('../models/repository');


// GET /api/comentarios/:documento_id
router.get("/:documento_id", verifyToken, async (req, res) => {
  try {
    const documento_id = Number(req.params.documento_id);
    if (!Number.isFinite(documento_id)) {
      return res.status(400).json({ error: "documento_id inválido" });
    }

    const data = await repo.obtenerComentariosPorDocumento(documento_id);
    return res.json(data || []);
  } catch (e) {
    console.error("GET comentarios error:", e);
    return res.status(500).json({ error: "Error al obtener comentarios" });
  }
});

// POST /api/comentarios { documento_id, texto }
router.post('/', verifyToken, checkPermisoComentar, async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const { documento_id, texto } = req.body || {};
    if (!documento_id || !texto) return res.status(400).json({ error: 'documento_id y texto requeridos' });

    const nuevo = await repo.crearComentario({ documento_id: Number(documento_id), usuario_id, texto });
    res.status(201).json(nuevo);
  } catch (e) {
    console.error('POST comentario error:', e);
    res.status(500).json({ error: 'Error al crear comentario' });
  }
});

// PUT /api/comentarios/:id { texto }
router.put('/:id', verifyToken, checkAutorComentario, async (req, res) => {
  try {
    const { id } = req.params;
    const { texto } = req.body;
    if (!texto) return res.status(400).json({ error: 'texto requerido' });

    const upd = await repo.actualizarComentario(Number(id), { texto });
    res.json(upd);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al actualizar comentario' });
  }
});

// DELETE /api/comentarios/:id
router.delete('/:id', verifyToken, checkAutorComentario, async (req, res) => {
  try {
    const { id } = req.params;
    await repo.eliminarComentario(Number(id));
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al eliminar comentario' });
  }
});


module.exports = router;


