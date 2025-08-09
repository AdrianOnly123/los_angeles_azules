// controllers/documentoController.js
const {
  crearDocumento,
  listarDocumentosConConteo,
  obtenerDocumentoPorId,
  actualizarDocumento,
  eliminarDocumento,
  esAutorDelDocumento, 
} = require("../models/repository");

async function create(req, res) {
  const archivo = req.file;
  const { nombre, tipo } = req.body;
  const creador_id = req.user?.id;
  
  if (!creador_id) return res.status(401).json({ error: "Token requerido" });
  if (!nombre || !tipo || !creador_id || !archivo) {
    return res.status(400).json({ error: "Faltan datos o archivo" });
  }
  try {
    const id = await crearDocumento({
      nombre,
      tipo,
      creador_id,
      archivo: archivo.path,
    });
    res.status(201).json({ mensaje: "Documento creado", id });
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
  const id = parseInt(req.params.id, 10);
  const { nombre, tipo } = req.body;
  if (!Number.isFinite(id))
    return res.status(400).json({ error: "ID inválido" });
  if (!nombre || !tipo) return res.status(400).json({ error: "Faltan datos" });

  try {
    // Solo autor puede actualizar
    if (!req.user?.id)
      return res.status(401).json({ error: "Token requerido" });
    const esAutor = await esAutorDelDocumento(id, req.user.id);
    if (!esAutor)
      return res.status(403).json({ error: "No puedes editar este documento" });

    const changed = await actualizarDocumento(id, { nombre, tipo });
    if (!changed) return res.status(404).json({ error: "No encontrado" });
    res.json({ mensaje: "Documento actualizado" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function remove(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id))
    return res.status(400).json({ error: "ID inválido" });

  try {
    // Solo autor puede eliminar
    if (!req.user?.id)
      return res.status(401).json({ error: "Token requerido" });
    const esAutor = await esAutorDelDocumento(id, req.user.id);
    if (!esAutor)
      return res
        .status(403)
        .json({ error: "No puedes eliminar este documento" });

    const deleted = await eliminarDocumento(id);
    if (!deleted) return res.status(404).json({ error: "No encontrado" });
    res.json({ mensaje: "Documento eliminado" });
  } catch (e) {
    // 1451 = FK constraint (comentarios)
    if (e.errno === 1451) {
      return res
        .status(409)
        .json({ error: "No se puede eliminar, tiene dependencias" });
    }
    res.status(500).json({ error: e.message });
  }
}

async function getById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isNaN(id) === false)
      return res.status(400).json({ error: "ID inválido" });

    const doc = await obtenerDocumentoPorId(id);
    if (!doc) return res.status(404).json({ error: "No encontrado" });

    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = {
  crearDocumento: create, // POST
  obtenerDocumentos: list,
  obtenerDocumentoPorId: getById, // GET
  actualizarDocumento: update,
  eliminarDocumento: remove,
};
