const express = require("express");
const router = express.Router();
const db = require("../models/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

router.post("/register", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Faltan datos" });
    }
    // Hash
    const hashedPassword = await bcrypt.hash(password, 10);
    // Inserta
    const sql =
      "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)";
    db.query(sql, [nombre, email, hashedPassword], (err, result) => {
      if (err) {
        console.error("REGISTER ERR:", err); // <— LOG CLAVE
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ error: "Email ya en uso" });
        }
        return res.status(500).json({ error: "Error interno al registrar" });
      }
      return res
        .status(201)
        .json({
          mensaje: "Usuario registrado correctamente",
          id: result.insertId,
        });
    });
  } catch (e) {
    console.error("REGISTER TRY/CATCH ERR:", e); // <— LOG CLAVE
    return res.status(500).json({ error: "Error interno" });
  }
});

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
