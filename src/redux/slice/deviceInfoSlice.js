import {createSlice} from '@reduxjs/toolkit';

export const deviceInfoSlice = createSlice({
  name:'deviceInfo',
  initialState: {
    currentDeviceInfo:"",
  },
  reducers: {
    setCurrentDeviceInfo: (state, action) => {
      state.currentDeviceInfo = action.payload;
    },
  },
});

export const {setCurrentDeviceInfo} = deviceInfoSlice.actions;

export default deviceInfoSlice.reducer;
