import { Game, Player } from "@/app/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {local: true} as Game;

export const game = createSlice({
  name: "game",
  initialState,
  reducers: {
    reset: () => initialState,
    setLocal : (state, action: PayloadAction<boolean>) => {
        return {...state,local: action.payload}
    }
  },
});

export const {
  reset,
  setLocal
} = game.actions;
export default game.reducer;
