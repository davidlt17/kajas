const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { saveBase64Image } = require('./itemsController');
const { logActivity } = require('../utils/logger');

exports.getAllBoxes = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT b.*, l.nombre as ubicacion_nombre 
            FROM boxes b 
            LEFT JOIN locations l ON b.ubicacion_id = l.id 
            WHERE b.user_id = $1
            ORDER BY b.nombre ASC
        `, [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener cajas' });
    }
};

exports.getBoxById = async (req, res) => {
    try {
        const boxResult = await db.query(`
            SELECT b.*, l.nombre as ubicacion_nombre 
            FROM boxes b 
            LEFT JOIN locations l ON b.ubicacion_id = l.id 
            WHERE (b.id::text = $1 OR b.qr_code_id = $1) AND b.user_id = $2
        `, [req.params.id, req.user.id]);

        if (boxResult.rows.length === 0) {
            return res.status(404).json({ error: 'Caja no encontrada' });
        }

        const box = boxResult.rows[0];
        const itemsResult = await db.query(
            'SELECT * FROM items WHERE caja_id = $1 AND user_id = $2 ORDER BY nombre ASC',
            [box.id, req.user.id]
        );

        box.items = itemsResult.rows;
        res.json(box);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener detalle de la caja' });
    }
};

exports.createBox = async (req, res) => {
    let { nombre, descripcion, ubicacion_id, qr_code_id, foto_url } = req.body;
    if (ubicacion_id === '') ubicacion_id = null;

    if (foto_url && foto_url.startsWith('data:image/')) {
        foto_url = saveBase64Image(foto_url);
    }

    try {
        const qrId = qr_code_id || uuidv4();
        const result = await db.query(
            'INSERT INTO boxes (nombre, descripcion, ubicacion_id, qr_code_id, foto_url, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [nombre, descripcion, ubicacion_id, qrId, foto_url || null, req.user.id]
        );
        logActivity(req.user.id, 'CREATE_BOX', `Creada la caja '${nombre}'`);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al crear caja' });
    }
};

exports.updateBox = async (req, res) => {
    let { nombre, descripcion, ubicacion_id, foto_url } = req.body;
    if (ubicacion_id === '') ubicacion_id = null;

    if (foto_url && foto_url.startsWith('data:image/')) {
        foto_url = saveBase64Image(foto_url);
    }

    try {
        const result = await db.query(
            'UPDATE boxes SET nombre = $1, descripcion = $2, ubicacion_id = $3, foto_url = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
            [nombre, descripcion, ubicacion_id, foto_url || null, req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Caja no encontrada' });
        logActivity(req.user.id, 'UPDATE_BOX', `Actualizada la caja '${nombre}'`);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar caja' });
    }
};

exports.deleteBox = async (req, res) => {
    try {
        const getResult = await db.query('SELECT nombre FROM boxes WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        if (getResult.rows.length === 0) return res.status(404).json({ error: 'Caja no encontrada' });
        const boxName = getResult.rows[0].nombre;

        await db.query(
            'DELETE FROM boxes WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        logActivity(req.user.id, 'DELETE_BOX', `Eliminada la caja '${boxName}'`);
        res.json({ message: 'Caja eliminada' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar caja' });
    }
};
