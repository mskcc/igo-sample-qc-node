import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import rootReducer from '../reducers/rootReducer';
import { persistStore } from 'redux-persist';

const customizedMiddleware = getDefaultMiddleware({
  serializableCheck: false
});

const store = configureStore({
  reducer: rootReducer,
  middleware: customizedMiddleware
});
let persistor = persistStore(store);

export { store, persistor };
