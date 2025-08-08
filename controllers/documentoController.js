// controllers/documentoController.js
const {
  crearDocumento,
  listarDocumentosConConteo,
  actualizarDocumento,
  eliminarDocumento
} = require('../models/repository');

async function create(req, res) {
  const archivo = req.file;
  const { nombre, tipo, creador_id } = req.body;
  if (!nombre || !tipo || !creador_id || !archivo) {
    return res.status(400).json({ error: 'Faltan datos o archivo' });
  }
  try {
    const id = await crearDocumento({ nombre, tipo, creador_id, archivo: archivo.path });
    res.json({ mensaje: 'Documento creado', id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function list(req, res) {
  try {
    const docs = await listarDocumentosConConteo();
    res.json(docs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function update(req, res) {
  const { id } = req.params;
  const { nombre, tipo } = req.body;
  if (!nombre || !tipo) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  try {
    const changed = await actualizarDocumento(id, { nombre, tipo });
    if (!changed) return res.status(404).json({ error: 'No encontrado' });
    res.json({ mensaje: 'Documento actualizado' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function remove(req, res) {
  const { id } = req.params;
  try {
    const deleted = await eliminarDocumento(id);
    if (!deleted) return res.status(404).json({ error: 'No encontrado' });
    res.json({ mensaje: 'Documento eliminado' });
  } catch (e) {
    if (e.errno === 1451) {
      return res.status(409).json({ error: 'No se puede eliminar, tiene dependencias' });
    }
    res.status(500).json({ error: e.message });
  }
}

module.exports = { create, list, update, remove };
