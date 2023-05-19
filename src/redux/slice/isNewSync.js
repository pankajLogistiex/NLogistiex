import {createSlice} from '@reduxjs/toolkit';

export const newSyncSlice = createSlice({
  name: 'newSync',
  initialState: {
    value: 0,
  },
  reducers: {
    setIsNewSync: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const {setIsNewSync} = newSyncSlice.actions;

export default newSyncSlice.reducer;
