import {createSlice} from '@reduxjs/toolkit';

export const currentDateSlice = createSlice({
  name: 'currentDate',
  initialState: {
    currentDateValue: 0,
  },
  reducers: {
    setCurrentDateValue: (state, action) => {
      state.currentDateValue = action.payload;
    },
  },
});

export const {setCurrentDateValue} = currentDateSlice.actions;

export default currentDateSlice.reducer;
