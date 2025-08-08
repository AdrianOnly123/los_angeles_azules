const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;


const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1]; // formato esperado: Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido o expirado' });

    req.user = user; 
    next();
  });
};

module.exports = verifyToken;
