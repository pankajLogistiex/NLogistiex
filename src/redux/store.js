import { configureStore } from "@reduxjs/toolkit";
import tripSlice from "./slice/tripSlice";
import userSlice from "./slice/userSlice";
import newSyncSlice from "./slice/isNewSync";
import newNotificationSlice from "./slice/notificationSlice";

export const store = configureStore({
  reducer: {
    trip: tripSlice,
    user: userSlice,
    newSync: newSyncSlice,
    notification: newNotificationSlice,
  },
});
