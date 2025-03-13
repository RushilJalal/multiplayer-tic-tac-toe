import GameBoard from "./components/GameBoard";
import { WebSocketProvider } from "./WebSocketContext";
import "./App.css";

function App() {
  return (
    <WebSocketProvider>
      <GameBoard />
    </WebSocketProvider>
  );
}

export default App;
