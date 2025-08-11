// controllers/documentos.js
const express = require("express");
const router = express.Router();

const documentosController = require("../controllers/documentoController");
const { verifyToken } = require('./middlewares/auth');
const upload = require('./middlewares/upload');


router.get("/", verifyToken, documentosController.obtenerDocumentos);

// Detalle: requiere estar logueado, pero NO checamos permisos aquí
router.get("/:id", verifyToken, documentosController.obtenerDocumentoPorId);

// Crear: logueado + multer
router.post("/", verifyToken, upload.single("archivo"), documentosController.crearDocumento);

// Actualizar: logueado
router.put("/:id", verifyToken, documentosController.actualizarDocumento);

// Eliminar: logueado
router.delete("/:id", verifyToken, documentosController.eliminarDocumento);
module.exports = router;
