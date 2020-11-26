const http=require('http');
const express = require('express');
const socketio= require('socket.io');
const cors = require('cors');

const router=require('./router');

const app = express();
const server= http.createServer(app);
const io=socketio(server,{
    log: false,
    agent: false,
    origins: 'localhost:3000'
    // 'transports': ['websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']
});

app.use(cors());
app.use(router);

io.on('connect',(socket)=>{
    console.log('We have a new connection!!!',socket.id);

    socket.on('disconnect',()=>{
        console.log('User had left !!!');
    })
});



server.listen(process.env.PORT || 5000,()=>console.log(`Server has started.`));
