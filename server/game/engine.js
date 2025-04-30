// engine.js - logique de jeu Gomoku
class Gomoku {
  constructor(size = 15) {
    this.size = size;
    this.board = Array.from({ length: size }, () => Array(size).fill(null));
    this.currentPlayer = 'X';
    this.winner = null;
  }

  placeMove(row, col) {
    if (this.board[row][col] || this.winner) return false;
    this.board[row][col] = this.currentPlayer;
    if (this.checkWinner(row, col)) {
      this.winner = this.currentPlayer;
    } else {
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }
    return true;
  }

  checkWinner(row, col) {
    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1]
    ];
    const player = this.board[row][col];

    for (const [dx, dy] of directions) {
      let count = 1;
      for (let dir of [-1, 1]) {
        let r = row + dir * dx;
        let c = col + dir * dy;
        while (this.inBounds(r, c) && this.board[r][c] === player) {
          count++;
          r += dir * dx;
          c += dir * dy;
        }
      }
      if (count >= 5) return true;
    }
    return false;
  }

  inBounds(row, col) {
    return row >= 0 && row < this.size && col >= 0 && col < this.size;
  }

  getBoard() {
    return this.board;
  }

  getCurrentPlayer() {
    return this.currentPlayer;
  }
}

module.exports = Gomoku;
