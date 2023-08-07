import { BoardCell, EndGame, Game, GameStage, Player, Riddle } from "@/app/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  player: {},
  pickedLetters: ["N", "R", "T", "L", "K", "E", "?", "?", "?", "?"],
  started: false,
  finished: false,
  won: false,
  endGameValue: 0
} as EndGame;

export const endGame = createSlice({
  name: "endGame",
  initialState,
  reducers: {
    reset: () => initialState,
    setLetters: (state, action: PayloadAction<String[]>) => {
      return { ...state, pickedLetters: action.payload };
    },
    startEndGame: (state) => {
      return { ...state, started: true }
    },
    setFinished: (state) => {
      return { ...state, finished: true }
    },
    setWon: (state, action: PayloadAction<Boolean>)=>{
      return {...state, won: action.payload}
    },
    setEndGameValue: (state, action: PayloadAction<number>)=>{
      return {...state, endGameValue: action.payload}
    }
  },
});

export const {
  reset,
  setLetters,
  startEndGame,
  setFinished,
  setWon,
  setEndGameValue,
} = endGame.actions;
export default endGame.reducer;
