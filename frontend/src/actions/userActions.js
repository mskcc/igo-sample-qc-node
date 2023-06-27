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

export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_FAIL = 'LOGIN_FAIL';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export function login(username, password) {
  return (dispatch) => {
    dispatch({ type: LOGIN_REQUEST, loading: true });
    return axios
      .post(Config.API_ROOT + '/login', {
        data: {
          username: username,
          password: password,
        },
      })
      .then((response) => {
        sessionStorage.setItem('access_token', response.data.access_token);
        sessionStorage.setItem('refresh_token', response.data.refresh_token);

        return dispatch({
          type: LOGIN_SUCCESS,
          loading: false,
          message: response.data.message,
          payload: response.data,
        });
      })

      .catch((error) => {
        return dispatch({
          type: LOGIN_FAIL,
          error: error,
        });
      });
  };
}

export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
export const LOGOUT_FAIL = 'LOGOUT_FAIL';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export function logout() {
  return (dispatch) => {
    dispatch({ type: LOGOUT_REQUEST, loading: true });
    sessionStorage.removeItem('persist:root');

    let access_token = sessionStorage.getItem('access_token');
    let refresh_token = sessionStorage.getItem('refresh_token');

    if (access_token) {
      axios
        .get(Config.API_ROOT + '/logoutAccess', {})
        .then((response) => {
          sessionStorage.removeItem('access_token');
        })
        .catch((error) => {
          return dispatch({
            type: LOGOUT_FAIL,
            message: 'reset',
          });
        });
    }
    let token = sessionStorage.getItem('refresh_token');

    if (refresh_token) {
      sessionStorage.removeItem('refresh_token');
      axios
        .get(
          Config.API_ROOT + '/logoutRefresh',
          { headers: { Authorization: `Bearer ${token}` } },
          {}
        )
        .then((response) => {
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
    } else
      return dispatch({
        type: LOGOUT_SUCCESS,
      });
  };
}

export const SUBMIT_FEEDBACK_REQUEST = 'SUBMIT_FEEDBACK_REQUEST';
export const SUBMIT_FEEDBACK_FAIL = 'SUBMIT_FEEDBACK_FAIL';
export const SUBMIT_FEEDBACK_SUCCESS = 'SUBMIT_FEEDBACK_SUCCESS';
export function submitFeedback(feedbackBody, feedbackSubject, feedbackType) {
  return (dispatch) => {
    dispatch({ type: SUBMIT_FEEDBACK_REQUEST, loading: true });
    return axios
      .post(Config.API_ROOT + '/submitFeedback', {
        data: {
          feedbackBody,
          feedbackSubject,
          feedbackType,
        },
      })
      .then((response) => {
        return dispatch({
          type: SUBMIT_FEEDBACK_SUCCESS,
          message: 'Feedback submitted. Thank you!',
        });
      })

      .catch((error) => {
        return dispatch({
          type: SUBMIT_FEEDBACK_FAIL,
          message: 'Error submitting feedback. Please email wagnerl@mskcc.org.',
        });
      });
  };
}
