import { Player } from "@/app/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = [{id:0,name:"JÁTÉKOS1",points:0,isSolving:false,totalPoints:0,placementPoints:0}] as Player[];
// {id:1,name:"Zsófi",points:0,isSolving:false,totalPoints:0}
export const players = createSlice({
  name: "players",
  initialState,
  reducers: {
    reset: () => initialState,
    setPlayers: (state, action: PayloadAction<Player[]>) => {
      return action.payload;
    },
    addPlayer: (state, action: PayloadAction<string>) => {
      const name = action.payload;
      state.push({ id: state.length, name, points: 0, isSolving: false, totalPoints: 0,spinnedPlacement: false, placementPoints: 0})
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
      return state.map(player=> ({...player, points: 0,placementPoints: 0}))
    },
    saveRoundPoints : (state) => {
      return state.map(player=> ({...player, totalPoints: player.totalPoints + player.points, points: 0}))
    },
    switchPlayersTotal : state => {
      return state.map(player=> ({...player, points: player.totalPoints, totalPoints: 0, }))
    },
    resetPlacements: state => {
      return state.map(player => ({...player,spinnedPlacement:false,placementPoints: 0}))
    },
    swapPlayerPoints: (state, action: PayloadAction<{"from":Player,"to":Player}>) => {
      const player1 = action.payload.from;
      const player2 = action.payload.to;
      return state.map(player => {
        if(player.id === player1.id){
          return {...player, points: player2.points}
        }
        if(player.id === player2.id){
          return {...player, points: player1.points}
        }
        return player;
      })
    }
  },
});

export const {
  setPlayers,
  addPlayer,
  removePlayer,
  modifyPlayer,
  resetRoundPoints,
  saveRoundPoints,
  switchPlayersTotal,
  resetPlacements,
  swapPlayerPoints,
  reset
} = players.actions;
export default players.reducer;
