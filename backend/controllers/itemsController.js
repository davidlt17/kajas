const db = require('../db');
const fs = require('fs');
const path = require('path');
const { logActivity } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

const saveBase64Image = (base64Str) => {
    if (!base64Str || !base64Str.startsWith('data:image/')) {
        return base64Str;
    }
    try {
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const matches = base64Str.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return base64Str;
        }

        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const data = Buffer.from(matches[2], 'base64');
        const filename = `${uuidv4()}.${ext}`;
        const filePath = path.join(uploadsDir, filename);

        fs.writeFileSync(filePath, data);
        return `/uploads/${filename}`;
    } catch (err) {
        console.error('Error al guardar la imagen:', err);
        return base64Str;
    }
};

exports.saveBase64Image = saveBase64Image;

exports.getAllItems = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM items WHERE user_id = $1 ORDER BY nombre ASC', [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener items' });
    }
};

exports.createItem = async (req, res) => {
    let { nombre, foto_url, cantidad, valor_estimado, categoria, caja_id } = req.body;
    if (caja_id === '') caja_id = null;
    if (categoria === '') categoria = null;
    
    if (foto_url && foto_url.startsWith('data:image/')) {
        foto_url = saveBase64Image(foto_url);
    }

    try {
        const result = await db.query(
            'INSERT INTO items (nombre, foto_url, cantidad, valor_estimado, categoria, caja_id, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [nombre, foto_url, cantidad || 1, valor_estimado || null, categoria || null, caja_id, req.user.id]
        );
        logActivity(req.user.id, 'CREATE_ITEM', `Añadido objeto '${nombre}' (Cant: ${cantidad || 1})`);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al crear item' });
    }
};

exports.updateItem = async (req, res) => {
    const { id } = req.params;
    let { nombre, cantidad, foto_url, valor_estimado, categoria, caja_id } = req.body;
    if (categoria === '') categoria = null;

    if (foto_url && foto_url.startsWith('data:image/')) {
        foto_url = saveBase64Image(foto_url);
    }

    let updateQuery;
    let updateParams;
    
    if (caja_id !== undefined) {
        if (caja_id === '') caja_id = null;
        updateQuery = 'UPDATE items SET nombre = $1, cantidad = $2, foto_url = $3, valor_estimado = $4, categoria = $5, caja_id = $6 WHERE id = $7 AND user_id = $8 RETURNING *';
        updateParams = [nombre, cantidad, foto_url || null, valor_estimado || null, categoria || null, caja_id, id, req.user.id];
    } else {
        updateQuery = 'UPDATE items SET nombre = $1, cantidad = $2, foto_url = $3, valor_estimado = $4, categoria = $5 WHERE id = $6 AND user_id = $7 RETURNING *';
        updateParams = [nombre, cantidad, foto_url || null, valor_estimado || null, categoria || null, id, req.user.id];
    }

    try {
        const result = await db.query(updateQuery, updateParams);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Item no encontrado' });
        logActivity(req.user.id, 'UPDATE_ITEM', `Actualizado objeto '${nombre}'`);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar item' });
    }
};

exports.deleteItem = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM items WHERE id = $1 AND user_id = $2 RETURNING *', [id, req.user.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Item no encontrado' });
        logActivity(req.user.id, 'DELETE_ITEM', `Eliminado objeto '${result.rows[0].nombre}'`);
        res.json({ message: 'Item eliminado correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar item' });
    }
};
