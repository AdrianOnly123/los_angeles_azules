// controllers/documentos.js
const { Router } = require('express');
const { verifyToken } = require('./middlewares/auth');

const router = Router();

// Ruta pública para comprobar que el router carga
router.get('/ping', (req, res) => {
  res.json({ ok: true });
});

// Ruta protegida mínima (sin upload ni otros middlewares todavía)
router.post('/', verifyToken, (req, res) => {
  res.status(201).json({ ok: true, user: req.user });
});

module.exports = router;
