const express = require('express');
const cors = require('cors');
const path = require('path');

const propertyRoutes = require('./src/routes/properties');
const uploadRoutes = require('./src/routes/upload');
const authRoutes = require('./src/routes/auth');
const healthRoutes = require('./src/routes/health');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/properties', propertyRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);

app.listen(PORT, () =>
  console.log(`Servidor rodando em http://localhost:${PORT}`)
);
