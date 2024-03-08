import axios from 'axios';
import { Config } from '../secret_config.js';
import { fetchCurrentUser, logoutUser } from '../util/services';

// Add a request interceptor
axios.defaults.withCredentials = true;

// Add a response interceptor
axios.interceptors.response.use(
  function(response) {
      // Do something with response data
      if (response.data.data) {
          response.payload = response.data.data;
          return response;
      }
      if (response.data) {
          response.payload = response.data;
          return response;
      }
      return response;
  },
  function(error) {
      // console.log(error);
      if (error.response) {
          error.payload = error.response.data;
          if (error.response.status === 401) {
              // Automatically redirect client to the login page
              window.location.href = `${Config.AUTH_URL}/${Config.SITE_HOME}`;
          }
      }
      // Do something with response error
      return Promise.reject(error);
  }
);

export const FETCH_USER = 'FETCH_USER';
export const FETCH_USER_SUCCESS = 'FETCH_USER_SUCCESS';
export const FETCH_USER_FAIL = 'FETCH_USER_FAIL';
export function fetchUser() {
    return (dispatch) => {
        dispatch({ type: FETCH_USER });
        return fetchCurrentUser()
            .then((response) => {
                return dispatch({
                    type: FETCH_USER_SUCCESS,
                    user: response,
                });
            })
            .catch((error) => {
                console.log(error);
                
                return dispatch({
                    type: FETCH_USER_FAIL,
                    error: error,
                });
            });
    };
}

export const LOGOUT = 'LOGOUT';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const LOGOUT_FAIL = 'LOGOUT_FAIL';
export function logout() {
    return (dispatch) => {
        dispatch({ type: LOGOUT });
        return logoutUser()
            .then(() => {
                return dispatch({
                    type: LOGOUT_SUCCESS,
                });
            })
            .catch((error) => {
                return dispatch({
                    type: LOGOUT_FAIL,
                    error: error,
                });
            });
    };
}
