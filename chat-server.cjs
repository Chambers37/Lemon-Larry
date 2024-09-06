const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors:{
    origin: "http://localhost:3000",
    methods:["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('CONNECTED TO THE WEB SOCKET');

  socket.on('new message sent', (newMessage) => {
    console.log('NEW MESSAGE', newMessage);

    io.emit('new message relay', newMessage)

  })

  socket.on('disconnet', ()=>{
    console.log('User disconnected', socket.id)
  })
});

app.get('/', (req, res) => {
  res.sendFile (__dirname + '/index.html')

});
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => console.log(`LISTENING ON ${PORT}`));
