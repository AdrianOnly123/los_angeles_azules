const express = require("express");
const router = express.Router();
const db = require("../models/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
  try {
    let { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Faltan datos' });
    }
    email = String(email).trim().toLowerCase();
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // 1) Checar duplicado
    db.query('SELECT id FROM usuarios WHERE email = ? LIMIT 1', [email], async (err, rows) => {
      if (err) {
        console.error('REGISTER CHECK ERR:', err);
        return res.status(500).json({ error: 'Error interno' });
      }
      if (rows.length) {
        return res.status(409).json({ error: 'Email ya en uso' });
      }

      // 2) Hash & crear
      try {
        const hashed = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)'; // si tu columna es "password"
        db.query(sql, [nombre.trim(), email, hashed], (err2, result) => {
          if (err2) {
            console.error('REGISTER INSERT ERR:', err2);
            if (err2.code === 'ER_DUP_ENTRY') {
              return res.status(409).json({ error: 'Email ya en uso' });
            }
            return res.status(500).json({ error: 'Error interno al registrar' });
          }

          // 3) Token + respuesta para el front
          const user = { id: result.insertId, nombre: nombre.trim(), email, rol: 'user' };
          const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
          );
          return res.status(201).json({ user, token });
        });
      } catch (hashErr) {
        console.error('REGISTER HASH ERR:', hashErr);
        return res.status(500).json({ error: 'Error al procesar contraseña' });
      }
    });
  } catch (e) {
    console.error('REGISTER TRY/CATCH ERR:', e);
    return res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;

// Login de usuario
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM usuarios WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0)
      return res.status(401).json({ error: "Credenciales inválidas" });

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch)
      return res.status(401).json({ error: "Credenciales inválidas" });

    const token = jwt.sign({ id: user.id, nombre: user.nombre }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      token,
      usuario: { id: user.id, nombre: user.nombre, email: user.email },
    });
  });
});

module.exports = router;
