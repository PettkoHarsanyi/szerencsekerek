import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Message, MessageDto, Player } from "@/app/types";

const initialState = [] as Message[];

export const message = createSlice({
  name: "messages",
  initialState,
  reducers: {
    reset: () => initialState,
    addMessage: (state, action: PayloadAction<MessageDto>) => {
      const { sender, message } = action.payload
      state.push({ sender, message, id: state.length })
    },
  },
});

export const {
  addMessage
} = message.actions;
export default message.reducer;
