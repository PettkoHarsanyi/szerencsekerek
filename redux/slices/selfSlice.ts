import { Player } from "@/app/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {id:0, name:"JÁTÉKOS1",points:0} as Player;

export const self = createSlice({
    name: "self",
    initialState,
    reducers: {
        reset: () => initialState,
        setSelf: (state, action: PayloadAction<Player>) => {
            const player = action.payload;
            return player;
        },
        modifySelf: (state, action: PayloadAction<Player>) => {
            const player = action.payload;
            if(player.id === state.id){
                return player;
            }else{
                return state;
            }
        }
    },
});

export const {
    setSelf,
    modifySelf,
    reset
} = self.actions;
export default self.reducer;
