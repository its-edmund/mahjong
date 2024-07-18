import { useContext, useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import Board from "./components/ui/board";
import { GameContext, GameProvider } from "./context/GameContext";

function App() {
  const { state, dealPieces } = useContext(GameContext);

  useEffect(() => {
    dealPieces();
  }, []);

  return (
    <div className="flex items-center w-screen h-screen justify-center">
      <Board />
    </div>
  );
}

export default App;
