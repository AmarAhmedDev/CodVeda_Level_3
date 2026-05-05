const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_codveda';

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    // Get auth header value
    const bearerHeader = req.headers['authorization'];
    
    // Check if bearer is undefined
    if (typeof bearerHeader !== 'undefined') {
        // Split at the space
        const bearer = bearerHeader.split(' ');
        // Get token from array
        const bearerToken = bearer[1];
        
        try {
            // Verify token
            const decoded = jwt.verify(bearerToken, JWT_SECRET);
            // Add user payload to request
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
    } else {
        // Forbidden
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }
};

module.exports = {
    verifyToken,
    requireAdmin,
    JWT_SECRET
};
