const jwt = require('jsonwebtoken');


exports.authenticateToken = async(req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) return res.sendStatus(401);
        const jwtSecret = process.env.JWT_SECRET;

        jwt.verify(token, jwtSecret, (err, user) => {
            if (err) return res.sendStatus(403);
            console.log(user);
            req.user = user;
            next();
        });
    } catch (error) {
        return res.status(500).json({error: error.message})
    }
}