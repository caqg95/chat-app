const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');


const { addUser, removeUser, getUser, getUsersInRoom } = require('./users.js')
const router = require('./router');

const app = express();
app.use(cors());
app.use(router);

const server = http.createServer(app);
const io = socketio(server, {
    cors: true
    //origins: ["localhost:3000"]
});

io.on('connect', (socket) => {
    //console.log('We have a new connection!!!',socket.id);

    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room });

        if (error) return callback(error);

        socket.join(user.room);

        socket.emit('message', { user: 'admin', text: `${user.name}, welcome to the room ${user.room}` });
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name}, has joined` });

        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
        //  console.log(getUsersInRoom(user.room));
        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        // console.log(user, message);
        if (user) {
            io.to(user.room).emit('message', { user: user.name, text: message });
            callback();
        }
       
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left.` });
            io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
            //console.log(getUsersInRoom(user.room));
        }
    })
});



server.listen(process.env.PORT || 5000, () => console.log(`Server has started.`));
