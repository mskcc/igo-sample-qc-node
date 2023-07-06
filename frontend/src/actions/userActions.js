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
