const db = require('../db');

exports.getStats = async (req, res) => {
    try {
        // 1. Total Estimated Value
        const valueResult = await db.query(
            'SELECT SUM(valor_estimado) as total_value FROM items WHERE user_id = $1',
            [req.user.id]
        );
        const totalValue = valueResult.rows[0].total_value || 0;

        // 2. Items by Category
        const categoryResult = await db.query(
            `SELECT categoria as name, COUNT(id) as value 
             FROM items 
             WHERE user_id = $1 AND categoria IS NOT NULL 
             GROUP BY categoria 
             ORDER BY value DESC`,
            [req.user.id]
        );
        const itemsByCategory = categoryResult.rows.map(row => ({
            name: row.name,
            value: parseInt(row.value, 10)
        }));

        // 3. Items by Location
        const locationResult = await db.query(
            `SELECT l.nombre as name, COUNT(i.id) as value 
             FROM items i 
             JOIN boxes b ON i.caja_id = b.id 
             JOIN locations l ON b.ubicacion_id = l.id 
             WHERE i.user_id = $1 
             GROUP BY l.nombre 
             ORDER BY value DESC`,
            [req.user.id]
        );
        const itemsByLocation = locationResult.rows.map(row => ({
            name: row.name,
            value: parseInt(row.value, 10)
        }));

        res.json({
            totalValue: parseFloat(totalValue),
            itemsByCategory,
            itemsByLocation
        });
    } catch (err) {
        console.error("Error fetching stats:", err);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
};
