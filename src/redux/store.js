import {configureStore} from '@reduxjs/toolkit';
import tripSlice from './slice/tripSlice';
import userSlice from './slice/userSlice';

export const store = configureStore({
  reducer: {
    trip: tripSlice,
    user: userSlice,
  },
});
