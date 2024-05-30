const { Schema , model } = require('mongoose')

const postSchema = new Schema({ 
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    title:String,
    image:String,
    likes:[{
      type:Schema.Types.ObjectId,
      ref:'User'
    }],
},{timestamps:true})

const Post = new model('Post', postSchema)

module.exports = Post