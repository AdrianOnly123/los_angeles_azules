const express = require('express');
const cors = require('cors');
require('dotenv').config();

const documentosRoutes = require('./routes/documentos');
const comentariosRoutes = require('./routes/comentarios');
const authRoutes = require('./routes/auth');


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/documentos', documentosRoutes);
app.use('/api/comentarios', comentariosRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3305;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
