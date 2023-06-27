import axios from 'axios';

import { Config } from '../secret_config.js';

// Add a request interceptor
axios.interceptors.request.use(
  (config) => {
    let token = sessionStorage.getItem('access_token');
    if (token && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);
// Add a response interceptor
axios.interceptors.response.use(
  function (response) {
    // Do something with response data
    return response;
  },
  function (error) {
    // Do something with response error
    return Promise.reject(error);
  }
);

export const SERVER_ERROR = 'SERVER_ERROR';

export const CHECK_VERSION = 'REQUEST_CHECK_VERSION';
export const CHECK_VERSION_SUCCESS = 'CHECK_VERSION_SUCCESS';
export const CHECK_VERSION_FAIL = 'CHECK_VERSION_FAIL';

export function checkVersion() {
  return (dispatch) => {
    dispatch({ type: CHECK_VERSION });
    return axios
      .get(Config.API_ROOT + '/checkVersion?', {
        params: {
          version: Config.VERSION,
        },
      })
      .then((response) => {
        return dispatch({
          type: CHECK_VERSION_SUCCESS,
          data: response.data,
        });
      })

      .catch((error) => {
        if (error.response) {
          dispatch({
            type: SERVER_ERROR,
            serverError: true,
            error: error,
          });
        } else {
          dispatch({
            type: SERVER_ERROR,
            serverError: true,
          });
        }
      });
  };
}

export const RESET_ERROR_MESSAGE = 'RESET_ERROR_MESSAGE';
export const SET_ERROR_MESSAGE = 'SET_ERROR_MESSAGE';

// Resets the currently visible error message.
export const setErrorMessage = () => ({
  type: SET_ERROR_MESSAGE,
});

// Resets the currently visible error message.
export const resetErrorMessage = () => ({
  type: RESET_ERROR_MESSAGE,
});

export const RESET_MESSAGE = 'RESET_MESSAGE';
export const SET_MESSAGE = 'SET_MESSAGE';

// Resets the currently visible error message.
export const setMessage = () => ({
  type: SET_MESSAGE,
});

// Resets the currently visible error message.
export const resetMessage = () => ({
  type: RESET_MESSAGE,
  message: 'reset',
});
