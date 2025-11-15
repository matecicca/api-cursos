// backend-escolar/index.js
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const usuariosRoutes = require('./routes/usuarios.routes.js');
const clasesRoutes = require('./routes/clases.routes.js');
const inscripcionesRoutes = require('./routes/inscripciones.routes.js');

const app = express();

// CORS primero
app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));
app.use(express.json());

// Mongo
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/escolar';
mongoose.connect(MONGODB_URI).then(() => {
  console.log('✅ MongoDB conectado');
}).catch(err => {
  console.error('❌ Error MongoDB:', err.message);
});

// Prefijo API
app.get('/', (req, res) => {
  res.send('<h2>API Escolar v1</h2><p>Visite <a href="http://localhost:5173/documentacion">la documentación</a> para más detalles.</p>');
});
app.get('/api/health', (req,res)=> res.json({ ok:true, ts:Date.now() }));
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/clases', clasesRoutes);
app.use('/api/inscripciones', inscripcionesRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 API en http://localhost:${PORT}`));
