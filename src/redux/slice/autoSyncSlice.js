import { createSlice } from "@reduxjs/toolkit";

export const autoSyncSlice = createSlice({
  name: "autoSync",
  initialState: {
    isAutoSyncEnable: true,
    syncTime: "12:00 AM",
    syncTimeFull: "",
    forceSync: false,
  },
  reducers: {
    setAutoSync: (state, action) => {
      state.isAutoSyncEnable = action.payload;
    },
    setSyncTime: (state, action) => {
      state.syncTime = action.payload;
    },
    setSyncTimeFull: (state, action) => {
      state.syncTimeFull = action.payload;
    },
    setForceSync: (state, action) => {
      state.forceSync = action.payload;
    },
  },
});

export const { setAutoSync, setSyncTime, setSyncTimeFull, setForceSync } =
  autoSyncSlice.actions;

export default autoSyncSlice.reducer;
