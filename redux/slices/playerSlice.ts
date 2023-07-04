import { Player } from "@/app/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = [{id:0,name:"JÁTÉKOS1",points:0,isSolving:false},{id:1,name:"Zsófi",points:0,isSolving:false}] as Player[];

export const players = createSlice({
  name: "players",
  initialState,
  reducers: {
    reset: () => initialState,
    addPlayer: (state, action: PayloadAction<Player>) => {
      const { name } = action.payload;
      state.push({ id: state.length, name, points: 0, isSolving: false})
    },
    removePlayer: (state, action: PayloadAction<number>) => {
      const number = action.payload;
      state.filter(player => player.id !== action.payload)
    },
    modifyPlayer: (state, action: PayloadAction<Player>) => {
      const modifiedPlayer = action.payload;
      return state.map(player => player.id === modifiedPlayer.id ? {...modifiedPlayer} : player)
    },
    resetRoundPoints : (state) => {
      return state.map(player=> ({...player, points: 0}))
    }
  },
});

export const {
  addPlayer,
  removePlayer,
  modifyPlayer,
  resetRoundPoints,
  reset
} = players.actions;
export default players.reducer;
