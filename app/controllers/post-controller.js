const Post = require('../models/post-model')
const cloudinary = require('../middlewares/cloudinary')
const { pick } = require('lodash')
const main = require('../../index')
const postsCltr = {}
const { v4: uuidv4 } = require('uuid');

postsCltr.all = async(req,res)=>{
    try{
        const posts = await Post.find().sort({createdAt: -1}).populate('userId').populate('likes')
        res.json(posts)
    }catch(err){
        res.status(500).json({error:'Internal Server Error'})
   }
}

postsCltr.own = async(req,res)=>{
    try{
        const userId = req.user.id
        const posts = await Post.find({userId: userId}).populate('userId').populate('likes')
        res.json(posts)
    }catch(err){
        res.status(500).json({error:'Internal Server Error'})
   }
}

postsCltr.one = async(req, res) => {
    try{
        const id = req.params.id
        const post = await Post.find({_id:id}).populate('likes').populate('userId')
        res.json(post)
    }catch(err){
        res.status(500).json({error:'Internal Server Error'})
    }
}

postsCltr.upload = async(req,res)=>{
    try{
        const file = req.file
        if(!file){
                return res.status(500).json({error:'No files uploaded'})
        }
        const response = await cloudinary.uploader.upload(file.path, { folder: 'Task' });
        res.json(response.secure_url)
    }catch(err){
        res.status(500).json({error:'Internal Server Error'})
    }
}

postsCltr.create = async(req,res)=>{
    try{
        const body = pick(req.body,['title','image'])
        const post1 = new Post(body)
        post1.userId = req.user.id
        await post1.save()
        res.json(post1)
    }catch(err){
        res.status(500).json({error:'Internal Server Error'})
    }
}

postsCltr.addLike = async(req,res)=>{
    try{
        const id = req.params.id
    const likeId = req.user.id
    const post = await Post.findByIdAndUpdate({_id:id},{$push:{likes: likeId}},{new:true})
    const postOwner = await Post.findById(id).populate('userId');
    const result = await Post.find().sort({createdAt: -1}).populate('userId').populate('likes')
    const uniquid = uuidv4();
    main.io.emit('addLike',result)
    if(postOwner.userId._id.toString() !=req.user.id ){
        main.io.to(postOwner.userId.socketId).emit('notification', {
            message: `${req.user.name} liked your post`,
            postId: postOwner._id,
            id:uniquid
        });
    }
    res.json({
        post,
        result 
    })
    } catch(err){
        res.status(500).json({error:'Internal Server Error'})
    }
}

postsCltr.removeLike = async(req,res)=>{
    try{
        const id = req.params.id
    const likeId = req.user.id
    const post = await Post.findByIdAndUpdate({_id:id},{$pull:{likes: likeId}},{new:true})
    const result = await Post.find().sort({createdAt: -1}).populate('userId').populate('likes')
    main.io.emit('removeLike',result)
    res.json(post)
    } catch(err){
        res.status(500).json({error:'Internal Server Error'})
    }    
}

postsCltr.delete = async(req,res)=>{
    try{
        const id = req.params.id
        const post = await Post.findByIdAndDelete({_id:id})
        res.json(post)
    } catch(err){
        res.status(500).json({error:'Internal Server Error'})
    }
}

module.exports = postsCltr