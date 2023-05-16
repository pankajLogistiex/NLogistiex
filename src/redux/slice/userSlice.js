import {createSlice} from '@reduxjs/toolkit';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    user_id: '',
    user_name: '',
    user_email: '',
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
  },
});

export const {setUserId, setUserEmail, setUserName} = userSlice.actions;

export default userSlice.reducer;
