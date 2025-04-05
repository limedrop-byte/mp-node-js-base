// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const messageElement = document.getElementById('message');
const playerInfoElement = document.getElementById('playerInfo');

// Player variables
const PLAYER_SIZE = 20;
const PLAYER_SPEED = 5;
let myPlayerId = null;
let myPlayerNumber = null;
let players = {};

// Connect to the server
const socket = io();

// Handle room full message
socket.on('roomFull', () => {
  messageElement.textContent = 'Room is full. Please try again later.';
  messageElement.style.display = 'block';
  canvas.style.opacity = '0.5';
});

// Handle player assignment
socket.on('playerAssignment', (data) => {
  myPlayerId = data.playerId;
  myPlayerNumber = data.playerNumber;
  players = data.players;
  
  playerInfoElement.textContent = `You are Player ${myPlayerNumber}`;
  
  // Start the game loop
  gameLoop();
  
  // Add keyboard event listeners
  window.addEventListener('keydown', handleKeyDown);
});

// Handle new player joining
socket.on('newPlayer', (data) => {
  players[data.playerId] = data.playerInfo;
});

// Handle player updates
socket.on('playerUpdate', (data) => {
  if (players[data.playerId]) {
    players[data.playerId].x = data.x;
    players[data.playerId].y = data.y;
  }
});

// Handle player disconnection
socket.on('playerDisconnect', (playerId) => {
  delete players[playerId];
});

// Handle keyboard input
function handleKeyDown(e) {
  if (!myPlayerId || !players[myPlayerId]) return;
  
  let moved = false;
  const player = players[myPlayerId];
  
  switch (e.key) {
    case 'ArrowUp':
      if (player.y > 0) {
        player.y -= PLAYER_SPEED;
        moved = true;
      }
      break;
    case 'ArrowDown':
      if (player.y < canvas.height - PLAYER_SIZE) {
        player.y += PLAYER_SPEED;
        moved = true;
      }
      break;
    case 'ArrowLeft':
      if (player.x > 0) {
        player.x -= PLAYER_SPEED;
        moved = true;
      }
      break;
    case 'ArrowRight':
      if (player.x < canvas.width - PLAYER_SIZE) {
        player.x += PLAYER_SPEED;
        moved = true;
      }
      break;
  }
  
  if (moved) {
    socket.emit('playerMove', {
      x: player.x,
      y: player.y
    });
  }
}

// Draw function
function draw() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw all players
  Object.keys(players).forEach(id => {
    const player = players[id];
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
    
    // Draw player number
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(player.playerNumber, player.x + PLAYER_SIZE / 2, player.y + PLAYER_SIZE / 2);
  });
}

// Game loop
function gameLoop() {
  draw();
  requestAnimationFrame(gameLoop);
} 