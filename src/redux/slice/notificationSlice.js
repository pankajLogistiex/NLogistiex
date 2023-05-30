import { createSlice } from "@reduxjs/toolkit";

export const newNotificationSlice = createSlice({
  name: "notification",
  initialState: {
    count: 0,
  },
  reducers: {
    setNotificationCount: (state, action) => {
      state.count = action.payload;
    },
  },
});

export const { setNotificationCount } = newNotificationSlice.actions;

export default newNotificationSlice.reducer;
