import React, { createContext, useReducer } from "react";
import gameReducer from "./GameReducer";
import { initialPieces, PieceType } from "../utils/piece";

const initialState = {
  pieces: initialPieces,
  players: [
    { id: 0, hand: [] },
    { id: 1, hand: [] },
    { id: 2, hand: [] },
    { id: 3, hand: [] },
  ],
  currentTurn: 0,
  // Add other initial game state properties
};

export const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Game logic functions
  const dealPieces = () => {
    const shuffledPieces = shuffleArray(state.pieces);
    const numPlayers = state.players.length;
    const numPiecesPerPlayer = 16;

    const updatedPlayers = state.players.map((player, index) => {
      const startIndex = index * numPiecesPerPlayer;
      const endIndex = startIndex + numPiecesPerPlayer;
      const playerPieces = shuffledPieces.slice(startIndex, endIndex);
      return { ...player, hand: playerPieces };
    });

    const remainingPieces = shuffledPieces.slice(
      numPiecesPerPlayer * numPlayers,
    );

    dispatch({
      type: "DEAL_PIECES",
      payload: { players: updatedPlayers, pieces: remainingPieces },
    });
  };

  // Add other game logic functions
  const updatePlayerHand = (playerId: number, newHand: PieceType[]) => {
    let updatedPlayers = state.players;
    updatedPlayers[playerId].hand = newHand;
    dispatch({
      type: "UPDATE_HAND",
      payload: { players: updatedPlayers },
    });
  };

  return (
    <GameContext.Provider value={{ state, dealPieces, updatePlayerHand }}>
      {children}
    </GameContext.Provider>
  );
};

// Helper function to shuffle the deck
const shuffleArray = (array: PieceType[]) => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};
