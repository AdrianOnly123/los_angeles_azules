const {
  tienePermisoParaComentar,
  esAutorDelComentario,
  esAutorDelDocumento,
} = require("../../models/repository");

exports.checkPermisoComentar = async (req, res, next) => {
  try {
    const documento_id = Number(req.params.documento_id || req.params.id || req.body.documento_id);
    const usuario_id = req.user?.id;
    if (!documento_id) return res.status(400).json({ error: "documento_id requerido" });
    if (!usuario_id) return res.status(401).json({ error: "No autorizado" });

    const ok = await tienePermisoParaComentar(documento_id, usuario_id);
    if (!ok) return res.status(403).json({ error: "No tienes permiso para comentar/ver" });
    next();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error de permisos" });
  }
};

exports.checkAutorComentario = async (req, res, next) => {
  try {
    const comentario_id = Number(req.params.id);
    const usuario_id = req.user?.id;
    if (!comentario_id) return res.status(400).json({ error: "id de comentario requerido" });
    if (!usuario_id) return res.status(401).json({ error: "No autorizado" });

    const ok = await esAutorDelComentario(comentario_id, usuario_id);
    if (!ok) return res.status(403).json({ error: "No eres autor del comentario" });
    next();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error de permisos" });
  }
};

exports.checkAutorDocumento = async (req, res, next) => {
  try {
    const documento_id = Number(req.params.id || req.body.documento_id);
    const usuario_id = req.user?.id;
    if (!documento_id) return res.status(400).json({ error: "documento_id requerido" });
    if (!usuario_id) return res.status(401).json({ error: "No autorizado" });

    const ok = await esAutorDelDocumento(documento_id, usuario_id);
    if (!ok) return res.status(403).json({ error: "No eres autor del documento" });
    next();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error de permisos" });
  }
};
