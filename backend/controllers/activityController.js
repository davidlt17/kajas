const db = require('../db');

exports.getActivity = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM activity_log WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching activity:", err);
        res.status(500).json({ error: 'Error al obtener el historial de actividad' });
    }
};
