import React from 'react';
import 'react-app-polyfill/ie9';
import 'react-app-polyfill/ie11';

import { LocalizeProvider } from 'react-localize-redux';
import { Provider } from 'react-redux';
import store from './store/configureStore';

import Root from './containers/Root';

import * as serviceWorker from './serviceWorker';

import './App.css';

function App() {
  return (
    <Provider store={store}>
      <LocalizeProvider store={store}>
          <Root />
      </LocalizeProvider>
    </Provider>
  );
}

export default App;

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
