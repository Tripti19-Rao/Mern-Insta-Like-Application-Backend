const jwt = require('jsonwebtoken')

const authenticateUser = (req,res,next)=>{
    const token = req.headers['authorization']
    if(!token){
        return res.status(401).json({error:'Authentication Error. Please login again'})
    }
    try{
        const tokenData = jwt.verify(token, process.env.JWT_SECRET)
        req.user = {
            id:tokenData.id,
            email:tokenData.email,
            username:tokenData.username,
            name:tokenData.name
        }
        next()
    }catch(err){
        res.status(400).json({errors:err.message})
    }
}

module.exports = authenticateUser