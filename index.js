require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json())
app.use(cors())

const configDb = require('./config/database')
configDb()

const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    }
});
const usersCltr = require('./app/controllers/user-controller')
const postsCltr = require('./app/controllers/post-controller')

const upload = require('./app/middlewares/multer')
const authenticateUser = require('./app/middlewares/auth')

const User = require('./app/models/user-model')


//User Register
app.post('/api/users/register',usersCltr.register)

//User Login
app.post('/api/users/login',usersCltr.login)

//POSTS

//All post
app.get('/api/posts',postsCltr.all)

//Users Posts
app.get('/api/users/posts',authenticateUser,postsCltr.own)

//Get one Post
app.get('/api/posts/one/:id',authenticateUser,postsCltr.one)

//Adding image
app.post('/api/images',upload.single('image'),postsCltr.upload)

//adding post
app.post('/api/posts',authenticateUser,postsCltr.create)

//Liking a post
app.get('/api/likes/:id',authenticateUser,postsCltr.addLike)

//Unliking a post
app.get('/api/unlikes/:id',authenticateUser,postsCltr.removeLike)

//Delete a post
app.delete('/api/delete:id',postsCltr.delete)



io.on('connection', (socket) => {
    socket.on('login', async function (data) { 
        const { userId, socketId } = data;
        try {
            const updatedUser = await User.findOneAndUpdate({_id:userId}, {socketId:socketId }, { new: true });
            console.log('Updated user:', updatedUser);
        } catch (err) {
            console.error('Error updating socket ID:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

exports.io = io

server.listen(process.env.PORT, ()=>{
    console.log('Server is running on port ' + process.env.PORT);
})


