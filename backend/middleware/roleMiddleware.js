const authorization = (roles) => (req,res, next)=>{
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if(!allowedRoles.includes(req.user.role)){
        return res.status(403).json({message:'Forbidden'})
    }
    next()
}

module.exports = authorization;