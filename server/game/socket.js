// socket.js - gestion des parties Gomoku avec Socket.IO
const { Server } = require('socket.io');
const Gomoku = require('./game/engine');

const activeGames = {}; // gameId -> { game: Gomoku, players: [socket1, socket2], moves: [] }

function setupSocket(server) {
  const io = new Server(server, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connecté : ${socket.id}`);

    socket.on('joinGame', ({ gameId, userId }) => {
      if (!activeGames[gameId]) {
        activeGames[gameId] = {
          game: new Gomoku(),
          players: [],
          moves: []
        };
      }

      const gameData = activeGames[gameId];
      if (gameData.players.length >= 2) {
        socket.emit('full', 'Partie pleine');
        return;
      }

      gameData.players.push({ socket, userId });
      socket.join(gameId);

      socket.emit('joined', { success: true, symbol: gameData.players.length === 1 ? 'X' : 'O' });
      if (gameData.players.length === 2) {
        io.to(gameId).emit('start', 'Partie lancée');
      }

      socket.on('move', ({ row, col }) => {
        const game = gameData.game;
        const symbol = game.getCurrentPlayer();
        const placed = game.placeMove(row, col);

        if (!placed) return;

        gameData.moves.push({ row, col, player: symbol });
        io.to(gameId).emit('move', { row, col, player: symbol });

        if (game.winner) {
          io.to(gameId).emit('gameOver', { winner: symbol });
          // TODO: Enregistrer dans la base PostgreSQL ici
          delete activeGames[gameId];
        }
      });

      socket.on('abandon', () => {
        const opponent = gameData.players.find(p => p.socket.id !== socket.id);
        if (opponent) {
          opponent.socket.emit('winByForfeit');
        }
        delete activeGames[gameId];
      });

      socket.on('disconnect', () => {
        console.log(`❌ Déconnecté : ${socket.id}`);
        const opponent = gameData.players.find(p => p.socket.id !== socket.id);
        if (opponent) {
          opponent.socket.emit('opponentLeft');
        }
        delete activeGames[gameId];
      });
    });
  });
}

module.exports = setupSocket;
