import GameBoard from "./components/GameBoard";
import { WebSocketProvider } from "./WebSocketContext";

function App() {
  return (
    <WebSocketProvider>
      <h1>Multiplayer Tic Tac Toe</h1>
      <GameBoard />
    </WebSocketProvider>
  );
}

export default App;
