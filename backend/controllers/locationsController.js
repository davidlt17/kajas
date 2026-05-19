const db = require('../db');
const { logActivity } = require('../utils/logger');
const { saveBase64Image } = require('./itemsController');

exports.getAllLocations = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM locations WHERE user_id = $1 ORDER BY nombre ASC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener ubicaciones' });
    }
};

exports.getLocationById = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM locations WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Ubicación no encontrada' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener ubicación' });
    }
};

exports.createLocation = async (req, res) => {
    let { nombre, descripcion, foto_url } = req.body;
    
    if (foto_url && foto_url.startsWith('data:image/')) {
        foto_url = saveBase64Image(foto_url);
    }

    try {
        const result = await db.query(
            'INSERT INTO locations (nombre, descripcion, foto_url, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, descripcion, foto_url || null, req.user.id]
        );
        logActivity(req.user.id, 'CREATE_LOCATION', `Creada la ubicación '${nombre}'`);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al crear ubicación' });
    }
};

exports.updateLocation = async (req, res) => {
    let { nombre, descripcion, foto_url } = req.body;

    if (foto_url && foto_url.startsWith('data:image/')) {
        foto_url = saveBase64Image(foto_url);
    }

    try {
        const result = await db.query(
            'UPDATE locations SET nombre = $1, descripcion = $2, foto_url = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
            [nombre, descripcion, foto_url || null, req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Ubicación no encontrada' });
        logActivity(req.user.id, 'UPDATE_LOCATION', `Actualizada la ubicación '${nombre}'`);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar ubicación' });
    }
};

exports.deleteLocation = async (req, res) => {
    try {
        const getResult = await db.query('SELECT nombre FROM locations WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        if (getResult.rows.length === 0) return res.status(404).json({ error: 'Ubicación no encontrada' });
        const locName = getResult.rows[0].nombre;

        await db.query(
            'DELETE FROM locations WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        logActivity(req.user.id, 'DELETE_LOCATION', `Eliminada la ubicación '${locName}'`);
        res.json({ message: 'Ubicación eliminada' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar ubicación' });
    }
};
