// controllers/documentos.js
const express = require("express");
const router = express.Router();

const documentosController = require("../controllers/documentoController");
const { verifyToken } = require('./middlewares/auth');
const upload = require('./middlewares/upload');
// Crear
router.post('/', upload.single('archivo'), documentosController.crearDocumento);

// Obtener
router.get("/", documentosController.obtenerDocumentos);

// Obtener
router.get('/:id', documentosController.obtenerDocumentoPorId);

// Actualizar
router.put("/:id", documentosController.actualizarDocumento);

// Eliminar
router.delete('/:id', verifyToken, documentosController.eliminarDocumento);

module.exports = router;
