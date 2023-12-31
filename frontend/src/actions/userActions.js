import axios from 'axios';

import { Config } from '../secret_config.js';

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
