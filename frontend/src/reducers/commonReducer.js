import Swal from 'sweetalert2';

const initialState = {
  version: '2.0',
  error: false,
  message: '',
  serverError: false,
  loading: false,
  loadingMessage: null,
};

// global errors and messages
function commonReducer(state = initialState, action) {
  const { error, message, serverError, loading, loadingMessage } = action;
  if (loadingMessage && loading) {
    return {
      ...state,
      loadingMessage: loadingMessage,
      loading: loading,
    };
  }
  if (loading) {
    return {
      ...state,
      loading: loading,
    };
  }

  if (serverError) {
    return {
      ...state,
      error: true,
      serverError: true,
      loading: false,
      message:
        'Our backend is experiencing some downtime. Please refresh, check back later or message an admin.',
    };
  }
  if (error && !message) {
    if (
      error.response &&
      !error.response.data.message &&
      error.response.status === 401
    ) {
      return {
        ...state,
        error: true,
        message: 'Your session expired. Please log back in.',
        loading: false,
      };
    } else if (error.response && error.response.status === 403) {
      Swal.fire({
        title: 'Not authorized',
        html:
          'You are not in the group of authorized users for this page. If you would like to request access, please email <a href="mailto:zzPDL_SKI_IGO_Sample_and_Project_Management@mskcc.org?subject=Sample Submission Site Access Request">the Sample and Project Management Team.</a>',
        type: "info",
        loading: false,
        animation: false,
        confirmButtonColor: '#007cba',
        confirmButtonText: 'Dismiss',
      });
      return {
        ...state,
      };
    } else if (error.response) {
      return {
        ...state,
        // error: true,
        message: error.response.data.message,
        loading: false,
      };
    }
  } else if (message) {
    if (message === 'reset') {
      return {
        ...state,
        message: '',
        loading: false,
      };
    } else {
      return {
        ...state,
        message: action.message,
        loading: false,
      };
    }
  }
  return { ...state };
}

export default commonReducer;
