const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const documentosRoutes = require("./controllers/documentos");
const comentariosRoutes = require("./controllers/comentarios");
const authRoutes = require("./controllers/auth");

const app = express();

// Middlewares base
app.use(cors()); // para dev está bien abierto; si quieres, configúralo por origin
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos subidos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rutas API
app.use("/api/documentos", documentosRoutes);
app.use("/api/comentarios", comentariosRoutes);
app.use("/api/auth", authRoutes);

// (Opcional) healthcheck rápido
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// (Opcional) 404 API
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

const PORT = process.env.PORT || 3305;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
