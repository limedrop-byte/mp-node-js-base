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

// Canvas resize function
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  
  // Set the actual canvas size (for crisp rendering)
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  
  // Scale the context to match the device pixel ratio
  ctx.scale(dpr, dpr);
  
  // Set the display size (CSS pixels)
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
}

// Initialize canvas size
window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', resizeCanvas);

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
  
  // Ensure canvas is properly sized before starting
  resizeCanvas();
  
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
  const canvasRect = canvas.getBoundingClientRect();
  const gameWidth = canvasRect.width;
  const gameHeight = canvasRect.height;
  
  switch (e.key) {
    case 'ArrowUp':
      if (player.y > 0) {
        player.y -= PLAYER_SPEED;
        moved = true;
      }
      break;
    case 'ArrowDown':
      if (player.y < gameHeight - PLAYER_SIZE) {
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
      if (player.x < gameWidth - PLAYER_SIZE) {
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
  const canvasRect = canvas.getBoundingClientRect();
  const gameWidth = canvasRect.width;
  const gameHeight = canvasRect.height;
  
  // Clear the canvas
  ctx.clearRect(0, 0, gameWidth, gameHeight);
  
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