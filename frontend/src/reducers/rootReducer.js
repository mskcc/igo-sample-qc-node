import { combineReducers } from 'redux';
import { localizeReducer } from 'react-localize-redux';
import communicationReducer from './communicationReducer';
import commonReducer from './commonReducer';
import userReducer from './userReducer';
import reportReducer from './reportReducer';
import { persistReducer } from 'redux-persist';
import sessionStorage from 'redux-persist/lib/storage/session'; // defaults to localStorage for web and AsyncStorage for react-native

const persistConfig = {
  key: 'root',
  storage: sessionStorage,
  whitelist: ['communication', 'user', 'report'],
};

const appReducer = combineReducers({
  communication: communicationReducer,
  common: commonReducer,
  user: userReducer,
  report: reportReducer,

  localize: localizeReducer,
});

const rootReducer = (state, action) => {
  if (action.user) {
    state = {
        ...state
    };
  }
  return appReducer(state, action);
};

export default persistReducer(persistConfig, rootReducer);
