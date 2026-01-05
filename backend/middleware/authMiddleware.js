const jwt = require('jsonwebtoken');
require('dotenv').config();
const authentication = (req, res, next) =>{
    const token =
    (req.cookies && req.cookies[process.env.COOKIE_NAME]) ||
    (req.headers.authorization && req.headers.authorization.split(' ')[1]);

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded;
        next()
    }
    catch(err){
        if (err.name === 'TokenExpiredError'){
            return res.status(401).json({message: "Session expired. Please login again. "})
        }
        return res.status(403).json({message: "Invalid token"})
    }
}

module.exports = authentication;