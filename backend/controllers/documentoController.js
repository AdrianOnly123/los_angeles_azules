const {
  crearDocumento,
  listarDocumentosConConteo,
  obtenerDocumentoPorId,
  actualizarDocumento,
  eliminarDocumento,
  esAutorDelDocumento, 
  otorgarPermiso,                 // <-- importa
} = require("../models/repository");

async function create(req, res) {
  const archivo = req.file;
  const { nombre, tipo } = req.body;
  const creador_id = req.user?.id;

  if (!creador_id) return res.status(401).json({ error: "Token requerido" });
  if (!nombre || !tipo || !archivo) {
    return res.status(400).json({ error: "Faltan datos o archivo" });
  }
  try {
    const id = await crearDocumento({
      nombre,
      tipo,
      creador_id,
      archivo: archivo.path,           // o `uploads/${req.file.filename}` si prefieres
    });

    // 👇 da permiso automáticamente al creador
    try { await otorgarPermiso(id, creador_id, 1); } 
    catch (ePerm) { console.error("Error otorgando permiso al creador:", ePerm); }

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
    if (!req.user?.id)
      return res.status(401).json({ error: "Token requerido" });
    const esAutor = await esAutorDelDocumento(id, req.user.id);
    if (!esAutor)
      return res.status(403).json({ error: "No puedes eliminar este documento" });

    const deleted = await eliminarDocumento(id);
    if (!deleted) return res.status(404).json({ error: "No encontrado" });
    res.json({ mensaje: "Documento eliminado" });
  } catch (e) {
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
    if (!Number.isFinite(id))
      return res.status(400).json({ error: "ID inválido" });

    // 👇 pasa el id de usuario para calcular puede_comentar con LEFT JOIN
    const doc = await obtenerDocumentoPorId(id, req.user?.id || 0);
    if (!doc) return res.status(404).json({ error: "No encontrado" });

    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = {
  crearDocumento: create,
  obtenerDocumentos: list,
  obtenerDocumentoPorId: getById,
  actualizarDocumento: update,
  eliminarDocumento: remove,
};
