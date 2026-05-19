const db = require('../db');

exports.globalSearch = async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json({ locations: [], boxes: [], items: [] });

    const searchTerm = `%${q}%`;
    const userId = req.user.id;

    try {
        // Search locations
        const locationsRes = await db.query(
            'SELECT id, nombre, foto_url FROM locations WHERE user_id = $1 AND (nombre ILIKE $2 OR descripcion ILIKE $2) LIMIT 5',
            [userId, searchTerm]
        );

        // Search boxes
        const boxesRes = await db.query(
            'SELECT id, nombre, foto_url FROM boxes WHERE user_id = $1 AND (nombre ILIKE $2 OR descripcion ILIKE $2) LIMIT 5',
            [userId, searchTerm]
        );

        // Search items
        const itemsRes = await db.query(
            'SELECT id, nombre, foto_url, caja_id, cantidad, categoria FROM items WHERE user_id = $1 AND (nombre ILIKE $2 OR categoria ILIKE $2) LIMIT 10',
            [userId, searchTerm]
        );

        res.json({
            locations: locationsRes.rows,
            boxes: boxesRes.rows,
            items: itemsRes.rows
        });
    } catch (err) {
        console.error("Error en búsqueda global:", err);
        res.status(500).json({ error: 'Error al realizar la búsqueda' });
    }
};
