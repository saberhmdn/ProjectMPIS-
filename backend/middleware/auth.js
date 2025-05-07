const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Set user info based on what's in the token
        req.user = decoded;
        
        // For backward compatibility with existing routes
        if (decoded.userId) {
            req.userId = decoded.userId;
        }
        if (decoded.studentId) {
            req.studentId = decoded.studentId;
        }
        if (decoded.teacherId) {
            req.teacherId = decoded.teacherId;
        }
        
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Token is not valid' });
    }
}; 
