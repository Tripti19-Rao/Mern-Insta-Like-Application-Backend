const { Schema , model } = require('mongoose')

const userSchema = new Schema({
    username:String,
    name:String,
    email:String,
    password:String,
    socketId: {
        type: String,
        default: null,
    },
},{timestamps:true})

const User = new model('User', userSchema)

module.exports = User