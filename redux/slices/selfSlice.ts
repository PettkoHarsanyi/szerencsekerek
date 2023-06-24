import { Player } from "@/app/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {id:0, name:"Peti",points:0} as Player;

export const self = createSlice({
    name: "self",
    initialState,
    reducers: {
        reset: () => initialState,
        setSelf: (state, action: PayloadAction<Player>) => {
            const player = action.payload;
            console.log(player);
            return player;
        },
    },
});

export const {
    setSelf,
    reset
} = self.actions;
export default self.reducer;
