import { combineReducers } from 'redux';
import { localizeReducer } from 'react-localize-redux';
import communicationReducer from './communicationReducer';
import commonReducer from './commonReducer';
import userReducer from './userReducer';
import reportReducer from './reportReducer';
import { persistReducer } from 'redux-persist';
import sessionStorage from 'redux-persist/lib/storage/session'; // defaults to localStorage for web and AsyncStorage for react-native
import { Config } from '../secret_config';

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

  if (action.type === 'LOGOUT_SUCCESS' || action.type === 'LOGOUT_FAIL') {
    console.log('goodbye');
    sessionStorage.removeItem('persist:root');
    window.location.href = `${Config.AUTH_URL}/${Config.BASENAME}`;
  }

  return appReducer(state, action);
};

export default persistReducer(persistConfig, rootReducer);
