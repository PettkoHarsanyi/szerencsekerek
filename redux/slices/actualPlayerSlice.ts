import { Player, PlayerDto } from "@/app/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {} as Player;

export const actualPlayer = createSlice({
  name: "actualPlayer",
  initialState,
  reducers: {
    reset: () => initialState,
    setActualPlayer: (state, action: PayloadAction<Player>) =>{
        return action.payload;
    } 
  },
});

export const {
  setActualPlayer,
  reset
} = actualPlayer.actions;
export default actualPlayer.reducer;
