const gameReducer = (state, action) => {
  switch (action.type) {
    case "DEAL_PIECES":
      return {
        ...state,
        players: action.payload.players,
        deck: action.payload.deck,
      };
    // Add other game actions and their corresponding state updates
    case "UPDATE_HAND":
      return {
        ...state,
        players: action.payload.players,
      };
    default:
      return state;
  }
};

export default gameReducer;
