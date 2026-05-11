const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
        req.user = verified;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token no válido' });
    }
};

module.exports = auth;
