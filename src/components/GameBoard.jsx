import { useState, useEffect } from "react";
import { useWebSocket } from "../WebSocketContext";
import Square from "./Square";

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
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 100px)" }}>
      {board.map((cell, index) => (
        <Square key={index} value={cell} onClick={() => handleClick(index)} />
      ))}
    </div>
  );
};

export default GameBoard;
