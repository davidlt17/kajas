const db = require('../db');

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
    let { nombre, foto_url, cantidad, valor_estimado, caja_id } = req.body;
    if (caja_id === '') caja_id = null;
    try {
        const result = await db.query(
            'INSERT INTO items (nombre, foto_url, cantidad, valor_estimado, caja_id, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [nombre, foto_url, cantidad || 1, valor_estimado, caja_id, req.user.id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al crear item' });
    }
};

exports.updateItem = async (req, res) => {
    const { id } = req.params;
    const { nombre, cantidad } = req.body;
    try {
        const result = await db.query(
            'UPDATE items SET nombre = $1, cantidad = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
            [nombre, cantidad, id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Item no encontrado' });
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
        res.json({ message: 'Item eliminado correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar item' });
    }
};
