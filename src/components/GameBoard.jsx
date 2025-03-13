import { useState, useEffect } from "react";
import { useWebSocket } from "../WebSocketContext";
import Square from "./Square";
import "../GameBoard.css";

const GameBoard = () => {
  const socket = useWebSocket();
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isMyTurn, setIsMyTurn] = useState(false);

  useEffect(() => {
    if (!socket) {
      console.error("socket not found");
      return;
    }

    socket.on("update-board", ({ board, turn }) => {
      setBoard(board);
      setIsMyTurn(turn === socket.id);
      console.log("my turn?", turn === socket.id);
    });

    socket.on("game-start", ({ board, turn }) => {
      setBoard(board);
      setIsMyTurn(turn === socket.id);
    });

    socket.on("game-over", ({ winner, board }) => {
      setBoard(board);
      alert(winner === "Draw" ? "It's a draw!" : `Player ${winner} wins!`);
      //refresh the page
      window.location.reload();
      //refresh the board
      setBoard(Array(9).fill(null));
      setIsMyTurn(false);
    });

    socket.on("player-disconnected", () => {
      alert("The other player disconnected. The game will end.");
      setBoard(Array(9).fill(null));
      setIsMyTurn(false);
    });

    return () => {
      socket.off("update-board");
      socket.off("game-start");
      socket.off("game-over");
      socket.off("player-disconnected");
    };
  }, [socket]);

  const handleClick = (index) => {
    if (!isMyTurn || board[index] !== null) return;
    console.log("Making move at index:", index);
    socket.emit("make-move", index);
  };

  return (
    <div className="game-board">
      <h1>Multiplayer Tic Tac Toe</h1>
      <div className="board">
        {board.map((cell, index) => (
          <Square key={index} value={cell} onClick={() => handleClick(index)} />
        ))}
      </div>
      <div className="status">
        <p>{isMyTurn ? "Your turn" : "Opponent's turn"}</p>
      </div>
    </div>
  );
};

export default GameBoard;
