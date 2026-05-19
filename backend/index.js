require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

// Importar rutas
const authRoutes = require('./routes/auth');
const locationsRoutes = require('./routes/locations');
const boxesRoutes = require('./routes/boxes');
const itemsRoutes = require('./routes/items');
const statsRoutes = require('./routes/stats');
const activityRoutes = require('./routes/activity');
const searchRoutes = require('./routes/search');

const auth = require('./middlewares/auth');
const errorHandler = require('./middlewares/errorHandler');

const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middlewares de rutas
app.use('/api/auth', authRoutes);
app.use('/api/locations', auth, locationsRoutes);
app.use('/api/boxes', auth, boxesRoutes);
app.use('/api/items', auth, itemsRoutes);
app.use('/api/stats', auth, statsRoutes);
app.use('/api/activity', auth, activityRoutes);
app.use('/api/search', auth, searchRoutes);

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
    try {
        await db.query('SELECT NOW()');
        console.log('Conexión a la base de datos exitosa');
    } catch (err) {
        console.error('Error conectando a la base de datos:', err.message);
    }
});
