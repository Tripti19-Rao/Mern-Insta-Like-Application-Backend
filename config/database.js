const mongoose = require('mongoose')

const configDb = async()=>{
    try{
        await mongoose.connect('mongodb://127.0.0.1:27017/nhance-task')
        console.log('Connected to db')
    } catch(err){
        console.log('Error connecting to db')
    }
}

module.exports = configDb