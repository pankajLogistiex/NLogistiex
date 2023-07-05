import { configureStore } from "@reduxjs/toolkit";
import tripSlice from "./slice/tripSlice";
import userSlice from "./slice/userSlice";
import newSyncSlice from "./slice/isNewSync";
import newNotificationSlice from "./slice/notificationSlice";
import autoSyncSlice from "./slice/autoSyncSlice";
import currentDateSlice from "./slice/currentDateSlice";
import deviceInfoSlice from "./slice/deviceInfoSlice";
export const store = configureStore({
  reducer: {
    trip: tripSlice,
    user: userSlice,
    newSync: newSyncSlice,
    notification: newNotificationSlice,
    autoSync: autoSyncSlice,
    currentDate:currentDateSlice,
    deviceInfo:deviceInfoSlice,
  },
});
