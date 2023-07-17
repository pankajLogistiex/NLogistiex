import {createSlice} from '@reduxjs/toolkit';

export const additionalWorkloadSlice = createSlice({
  name:'additionalWorkloadInfo',
  initialState: {
    currentAdditionalWorkloadInfo:"",
  },
  reducers: {
    setAdditionalWorkloadData: (state, action) => {
      state.currentAdditionalWorkloadInfo = action.payload;
    },
  },
});

export const {setAdditionalWorkloadData} = additionalWorkloadSlice.actions;

export default additionalWorkloadSlice.reducer;
