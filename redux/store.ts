import { configureStore } from "@reduxjs/toolkit";
import players from "./slices/playerSlice"
import messages from "./slices/messageSlice"
import self from "./slices/selfSlice"
import actualPlayer from "./slices/actualPlayerSlice"
import endGame from "./slices/endGameSlice"
import game from "./slices/gameSlice"

export const store = configureStore({
  reducer: {
    players,
    messages,
    self,
    actualPlayer,
    endGame,
    game,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;