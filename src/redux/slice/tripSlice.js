import {createSlice} from '@reduxjs/toolkit';

export const tripSlice = createSlice({
  name: 'trip',
  initialState: {
    tripStatus: 0,
  },
  reducers: {
    setTripStatus: (state, action) => {
      state.tripStatus = action.payload;
    },
  },
});

export const {setTripStatus} = tripSlice.actions;

export default tripSlice.reducer;
