import { BoardCell, Game, GameStage, Player, Riddle } from "@/app/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {local: true, stage: GameStage.SPINNING,gameTable: [],currentRiddle: {riddle:"",title:""},round: 0} as Game;

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
    }
  },
});

export const {
  reset,
  setLocal,
  setStage,
  setGameTable,
  setCurrentRiddle
} = game.actions;
export default game.reducer;
