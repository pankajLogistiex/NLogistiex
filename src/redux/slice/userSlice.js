import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    user_id: "",
    user_name: "",
    user_email: "",
    token: "",
    idToken: "",
    refreshToken: "",
    refreshTime: null,
  },
  reducers: {
    setUserId: (state, action) => {
      state.user_id = action.payload;
    },
    setUserEmail: (state, action) => {
      state.user_email = action.payload;
    },
    setUserName: (state, action) => {
      state.user_name = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setIdToken: (state, action) => {
      state.idToken = action.payload;
    },
    setRefreshToken: (state, action) => {
      state.refreshToken = action.payload;
    },
    setRefreshTime: (state, action) => {
      state.refreshTime = action.payload;
    },
  },
});

export const {
  setUserId,
  setUserEmail,
  setUserName,
  setToken,
  setIdToken,
  setRefreshToken,
  setRefreshTime,
} = userSlice.actions;

export default userSlice.reducer;
