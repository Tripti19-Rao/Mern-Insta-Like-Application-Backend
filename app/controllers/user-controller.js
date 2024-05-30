const User = require('../models/user-model')
const { pick } = require('lodash')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const usersCltr = {}

usersCltr.register = async(req,res)=>{
    try{
        const body = pick(req.body,['username','name','email','password'])
        const user1 = new User(body)
        const salt = await bcryptjs.genSalt()
        const encryptedPassword = await bcryptjs.hash(user1.password, salt)
        user1.password = encryptedPassword;
        await user1.save()
        res.json(user1)
    } catch(err){
        res.status(500).json({error:'Internal Server Error'})
    }
}

usersCltr.login = async(req,res)=>{
    try{
        const body = pick(req.body,['email','password'])
        const user = await User.findOne({email:body.email})
        if(!user){
            return res.status(404).json({errors:'Invalid email/password'})
        }
        const checkPassword = await bcryptjs.compare(body.password, user.password)
        if(!checkPassword){
            return res.status(404).json({error:'Invalid email/password'})
        }
        const tokenData = {
            id:user._id,
            email:user.email,
            username:user.username,
            name:user.name,
        }
        const token = jwt.sign(tokenData, process.env.JWT_SECRET,{expiresIn:'14d'})
        res.json({token:token})
    } catch(err){
        res.status(500).json({error: 'Internal server error'})
    }
}

module.exports = usersCltr