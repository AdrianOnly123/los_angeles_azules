const express = require('express');
const cors = require('cors');
require('dotenv').config();

const documentosRoutes = require('./controllers/documentos');
const comentariosRoutes = require('./controllers/comentarios');
const authRoutes = require('./controllers/auth');
const docRouter = require('./controllers/documentos'); // o el nombre que tengas




const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/documentos', documentosRoutes);
app.use('/api/comentarios', comentariosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/documentos', docRouter);

const PORT = process.env.PORT || 3305;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
