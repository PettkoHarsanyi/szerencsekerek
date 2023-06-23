import { Player, PlayerDto } from "@/app/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = [] as Player[];

export const players = createSlice({
  name: "players",
  initialState,
  reducers: {
    reset: () => initialState,
    addPlayer: (state, action: PayloadAction<PlayerDto>) => {
      const { name } = action.payload;
      state.push({ id: state.length, name, points: 0})
    },
    removePlayer: (state, action: PayloadAction<number>) => {
      const number = action.payload;
      state.filter(player => player.id !== action.payload)
    },
    modifyPlayer: (state, action: PayloadAction<Player>) => {
      const modifiedPlayer = action.payload;
      return state.map(player => player.id === modifiedPlayer.id ? modifiedPlayer : player)
    }
  },
});

export const {
  addPlayer,
  removePlayer,
  modifyPlayer,
  reset
} = players.actions;
export default players.reducer;
