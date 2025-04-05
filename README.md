# Multiplayer Canvas Game

A simple 2-player game with real-time movement using Node.js, Express, and Socket.IO.

## Features

- Canvas-based gameplay (1000x1000 pixels)
- Two player multiplayer game
- Real-time movement using arrow keys
- WebSocket communication via Socket.IO
- Room capacity limited to 2 players

## Requirements

- Node.js
- npm

## Installation

1. Install dependencies:
```
npm install
```

2. Start the server:
```
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

4. Open another browser window to connect a second player.

## How to Play

- Use arrow keys (up, down, left, right) to move your player
- All players are the same color
- If a third player tries to connect, they will see a "Room is full" message 