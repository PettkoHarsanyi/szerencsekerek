import { BoardCell, Game, GameStage, Player, Riddle } from "@/app/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  local: true, 
  stage: GameStage.PLACEMENT,
  // stage: GameStage.ENDGAME_SPINNING,
  // stage: GameStage.ENDGAME_PICKING,
  gameTable: [],
  currentRiddle: {riddle:"",title:""},
  round: 1,
  backToSpin: false,
  freeGame: false,
} as Game;

export const game = createSlice({
  name: "game",
  initialState,
  reducers: {
    reset: () => initialState,
    setLocal : (state, action: PayloadAction<boolean>) => {
        return {...state,local: action.payload}
    },
    setStage : (state, action: PayloadAction<GameStage>) => {
      return {...state, stage: action.payload}
    },
    setGameTable : (state, action: PayloadAction<BoardCell[][]>) => {
      return {...state, gameTable: action.payload};
    },
    setCurrentRiddle : (state, action: PayloadAction<Riddle>) => {
      return {...state, currentRiddle: action.payload}
    },
    addRound : (state) => {
      return {...state,round: state.round+1}
    },
    setBackToSpin: (state,action: PayloadAction<boolean>) => {
      return {...state, backToSpin: action.payload}
    },
    setFreeGame: (state, action: PayloadAction<boolean>) => {
      return {...state, freeGame: action.payload}
    }
  },
});

export const {
  reset,
  setLocal,
  setStage,
  setGameTable,
  setCurrentRiddle,
  setBackToSpin,
  setFreeGame,
  addRound
} = game.actions;
export default game.reducer;
