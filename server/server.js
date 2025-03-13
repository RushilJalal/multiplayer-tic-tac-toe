/* eslint-disable no-undef */
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // React frontend URLs
    methods: ["GET", "POST"],
}));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174"], // React frontend URLs
        methods: ["GET", "POST"],
    },
});

let waitingPlayer = null; // Store waiting player
let games = {}; // Store active games

io.on("connection", (socket) => {
    console.log(`Player connected: ${socket.id}`);

    if (waitingPlayer) {
        // Pair the new player with the waiting player
        const room = `${waitingPlayer.id}-${socket.id}`;
        socket.join(room);
        waitingPlayer.join(room);

        // Initialize game state
        const gameState = {
            board: Array(9).fill(null),
            turn: waitingPlayer.id, // First player starts
            players: { X: waitingPlayer.id, O: socket.id },
        };

        games[room] = gameState;

        // Notify players
        io.to(room).emit("game-start", gameState);

        waitingPlayer = null; // Reset waiting player
    } else {
        // Wait for another player
        waitingPlayer = socket;
    }

    // Handle move
    socket.on("make-move", (index) => {
        console.log(`Move made by player ${socket.id} at index ${index}`); // Debugging statement
        const room = Object.keys(games).find((r) =>
            r.includes(socket.id)
        );
        if (!room || !games[room]) return;

        let game = games[room];
        if (game.board[index] !== null || game.turn !== socket.id) return;

        // Determine player symbol
        const playerSymbol = game.players.X === socket.id ? "X" : "O";
        game.board[index] = playerSymbol;
        game.turn = game.turn === game.players.X ? game.players.O : game.players.X;

        // Check for a winner
        const winner = checkWinner(game.board);
        if (winner) {
            io.to(room).emit("game-over", { winner, board: game.board });
            delete games[room];
        } else {
            io.to(room).emit("update-board", { board: game.board, turn: game.turn });
        }
    });

    socket.on("disconnect", () => {
        console.log(`Player disconnected: ${socket.id}`);
        if (waitingPlayer === socket) {
            waitingPlayer = null;
        }

        // Remove player from any game they were in
        const room = Object.keys(games).find((r) =>
            r.includes(socket.id)
        );
        if (room) {
            io.to(room).emit("player-disconnected");
            delete games[room];
        }
    });
});

// Function to check winner
const checkWinner = (board) => {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6], // Diagonals
    ];

    for (let combo of winningCombinations) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return board.includes(null) ? null : "Draw";
};

server.listen(5000, () => console.log("Server running on port 5000"));