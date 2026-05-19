const db = require('../db');

exports.logActivity = async (userId, action, details) => {
    try {
        await db.query(
            'INSERT INTO activity_log (user_id, action, details) VALUES ($1, $2, $3)',
            [userId, action, details]
        );
    } catch (err) {
        console.error("Error logging activity:", err);
    }
};
