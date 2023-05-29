import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    user_id: "",
    user_name: "",
    user_email: "",
    token: "",
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
  },
});

export const { setUserId, setUserEmail, setUserName, setToken, setIdToken } =
  userSlice.actions;

export default userSlice.reducer;
