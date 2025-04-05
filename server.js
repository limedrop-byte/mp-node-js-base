const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files from the current directory
app.use(express.static(__dirname));

// Game state
let players = {};
let playerCount = 0;
const MAX_PLAYERS = 2;

io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Check if room is full
  if (playerCount >= MAX_PLAYERS) {
    socket.emit('roomFull');
    return;
  }
  
  // Assign player number and color
  playerCount++;
  const playerId = socket.id;
  const playerNumber = playerCount;
  
  // Create player
  players[playerId] = {
    x: Math.floor(Math.random() * 980),
    y: Math.floor(Math.random() * 980),
    color: 'blue',
    playerNumber: playerNumber
  };
  
  // Send player info to the new player
  socket.emit('playerAssignment', {
    playerId: playerId,
    playerNumber: playerNumber,
    players: players
  });
  
  // Broadcast to other players about the new player
  socket.broadcast.emit('newPlayer', {
    playerId: playerId,
    playerInfo: players[playerId]
  });
  
  // Handle player movement
  socket.on('playerMove', (data) => {
    if (players[playerId]) {
      players[playerId].x = data.x;
      players[playerId].y = data.y;
      
      // Broadcast player movement to all clients
      socket.broadcast.emit('playerUpdate', {
        playerId: playerId,
        x: data.x,
        y: data.y
      });
    }
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected');
    if (players[playerId]) {
      playerCount--;
      delete players[playerId];
      io.emit('playerDisconnect', playerId);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 