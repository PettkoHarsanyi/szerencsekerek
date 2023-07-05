import { Player } from "@/app/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = [{id:0,name:"JÁTÉKOS1",points:0,isSolving:false,totalPoints:0}] as Player[];
// {id:1,name:"Zsófi",points:0,isSolving:false,totalPoints:0}
export const players = createSlice({
  name: "players",
  initialState,
  reducers: {
    reset: () => initialState,
    addPlayer: (state, action: PayloadAction<string>) => {
      const name = action.payload;
      state.push({ id: state.length, name, points: 0, isSolving: false, totalPoints: 0,spinnedPlacement: false})
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
    },
    saveRoundPoints : (state) => {
      return state.map(player=> ({...player, totalPoints: player.totalPoints + player.points, points: 0}))
    },
    switchPlayersTotal : state => {
      return state.map(player=> ({...player, points: player.totalPoints, totalPoints: 0, }))
    },
    resetPlacements: state => {
      return state.map(player => ({...player,spinnedPlacement:false}))
    }
  },
});

export const {
  addPlayer,
  removePlayer,
  modifyPlayer,
  resetRoundPoints,
  saveRoundPoints,
  switchPlayersTotal,
  resetPlacements,
  reset
} = players.actions;
export default players.reducer;
