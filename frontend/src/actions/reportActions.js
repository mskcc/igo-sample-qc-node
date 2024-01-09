import axios from 'axios';
import FileSaver from 'file-saver';
import XLSX from 'xlsx';

import { Config } from '../secret_config.js';
import {
  fillReportTables,
  generateDecisionSubmitData,
  setTableReadOnlyAfterDecisions,
  isEmpty,
} from './helpers';
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

export const GET_REQUEST_REQUEST = 'GET_REQUEST_REQUEST';

export const EXPIRED = 'EXPIRED';
export const GET_REQUEST_FAIL = 'GET_REQUEST_FAIL';
export const GET_REQUEST_SUCCESS = 'GET_REQUEST_SUCCESS';
export function getRequest(requestId) {
  return (dispatch, getState) => {
    dispatch({
      type: GET_REQUEST_REQUEST,
      requestId: requestId,
      loading: true,
      loadingMessage: 'Searching for Request ' + requestId,
    });
    // let username = getState().user.username;
    // let userRole = getState().user.role;
    return axios
      .get(Config.API_ROOT + `/qcReport/getRequestSamples?request_id=${requestId}`, {
        // params: {
        //   request_id: requestId,
        //   // username: username,
        //   // role: userRole,
        // },
      })
      .then((response) => {
        return dispatch({
          type: GET_REQUEST_SUCCESS,
          payload: response.data.data,
        });
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          return dispatch({
            type: EXPIRED,
            error: error,
          });
        } else {
          return dispatch({
            type: GET_REQUEST_FAIL,
            message: 'reset',
          });
        }
      });
  };
}
export const CLEAR_REQUEST = 'CLEAR_REQUEST';
export function clearRequest() {
  return (dispatch) => {
    dispatch({
      type: CLEAR_REQUEST,
      requestId: undefined,
      loading: false,
    });
  };
}
export const REPORT_CLICK = 'REPORT_CLICK';
export function reportClick(report) {
  return (dispatch) => {
    dispatch({
      type: REPORT_CLICK,
      payload: report,
    });
  };
}

export const GET_REPORT_REQUEST = 'GET_REPORT_REQUEST';
export const GET_REPORT_FAIL = 'GET_REPORT_FAIL';
export const GET_REPORT_SUCCESS = 'GET_REPORT_SUCCESS';
export function getQcReports(requestId, otherSampleIds) {
  return (dispatch, getState) => {
    dispatch({
      type: GET_REPORT_REQUEST,
      loading: true,
      loadingMessage: 'Request found. Checking QC Tables...',
    });
    return axios
      .post(Config.API_ROOT + '/qcReport/getQcReportSamples', {
        data: {
          request: requestId,
          samples: getState().report.request.samples,
          user: getState().user,
        },
      })
      .then((response) => {
        let tables = fillReportTables(response.data.data.tables);
        if (isEmpty(tables)) {
          return dispatch({
            type: GET_REPORT_FAIL,
            message: 'reset',
            loading: false,
          });
        } else {
          dispatch({
            type: GET_REPORT_SUCCESS,
            message: 'reset',
            payload: {
              // readOnly: response.data.read_only,
              tables: tables,
            },
          });
        }
      })
      .catch((error) => {
        return dispatch({
          type: GET_REPORT_FAIL,
          error: error,
          loading: false,
        });
      });
  };
}

export const GET_PENDING_REQUEST = 'GET_PENDING_REQUEST';
export const GET_PENDING_FAIL = 'GET_PENDING_FAIL';
export const GET_PENDING_SUCCESS = 'GET_PENDING_SUCCESS';
export function getPending() {
  return (dispatch, getState) => {
    dispatch({
      type: GET_PENDING_REQUEST,
      loading: true,
      loadingMessage: 'Submitting...',
    });
    let endpoint;
    if (getState().user.role === 'lab_member') {
      endpoint = '/pending/getPendingRequests';
    } else {
      endpoint = '/pending/getPendingRequests';
    }
    return axios
      .get(Config.API_ROOT + endpoint, {})
      .then((response) => {
        dispatch({
          type: GET_PENDING_SUCCESS,
          pending: response.data,
          message: 'reset',
        });
      })

      .catch((error) => {
        return dispatch({
          type: GET_PENDING_FAIL,
          error: error,
          message:
            'Fetching pending requests failed due to an application error.',
        });
      });
  };
}
export const POST_INVESTIGATOR_DECISION_REQUEST =
  'POST_INVESTIGATOR_DECISION_REQUEST';
export const POST_INVESTIGATOR_DECISION_FAIL =
  'POST_INVESTIGATOR_DECISION_FAIL';
export const POST_INVESTIGATOR_DECISION_SUCCESS =
  'POST_INVESTIGATOR_DECISION_SUCCESS';
export function submitInvestigatorDecision() {
  return (dispatch, getState) => {
    dispatch({
      type: POST_INVESTIGATOR_DECISION_REQUEST,
      loading: true,
      loadingMessage: 'Submitting...',
    });
    let decisions = generateDecisionSubmitData(
      getState().report.tables,
      getState().report.reportShown
    );
    let request_id = getState().report.request.requestId;
    let username = getState().user.username;
    let report = getState().report.reportShown;

    return axios
      .post(Config.API_ROOT + '/qcReport/setQCInvestigatorDecision', {
        data: {
          decisions,
          username,
          request_id,
          report,
        },
      })
      .then((response) => {
        dispatch({
          type: POST_INVESTIGATOR_DECISION_SUCCESS,
          payload: setTableReadOnlyAfterDecisions(
            getState().report.tables,
            getState().report.reportShown,
            true
          ),
          message: 'Submitted!',
        });
      })
      .catch((error) => {
        return dispatch({
          type: POST_INVESTIGATOR_DECISION_FAIL,
          payload: setTableReadOnlyAfterDecisions(
            getState().report.tables,
            getState().report.reportShown,
            false
          ),
          message:
            'Decisions could not be submitted due to an application error. Please reach out to IGO.',
          error: error,
        });
      });
  };
}

export const POST_PARTIAL_DECISION_REQUEST = 'POST_PARTIAL_DECISION_REQUEST';
export const POST_PARTIAL_DECISION_FAIL = 'POST_PARTIAL_DECISION_FAIL';
export const POST_PARTIAL_DECISION_SUCCESS = 'POST_PARTIAL_DECISION_SUCCESS';
export function savePartialDecision() {
  return (dispatch, getState) => {
    dispatch({
      type: POST_PARTIAL_DECISION_REQUEST,
      loading: true,
      loadingMessage: 'Submitting...',
    });
    let decisions = generateDecisionSubmitData(
      getState().report.tables,
      getState().report.reportShown
    );
    let request_id = getState().report.request.requestId;
    let username = getState().user.username;
    let report = getState().report.reportShown;

    return axios
      .post(Config.API_ROOT + '/qcReport/savePartialSubmission', {
        data: {
          decisions,
          username,
          request_id,
          report,
        },
      }).then((response) => {
        dispatch({
          type: POST_PARTIAL_DECISION_SUCCESS,
          message: 'Saved! To submit saved decisions, please click "Submit to IGO" button.',
        });
      }).catch((error) => {
        return dispatch({
          type: POST_PARTIAL_DECISION_FAIL,
          message:
            'Decisions could not be saved due to an application error. Please reach out to IGO.',
          error: error,
        });
      });
  };
}
export const MANUALLY_ADD_DECISION_REQUEST = 'MANUALLY_ADD_DECISION_REQUEST';
export const MANUALLY_ADD_DECISION_FAIL = 'MANUALLY_ADD_DECISION_FAIL';
export const MANUALLY_ADD_DECISION_SUCCESS = 'MANUALLY_ADD_DECISION_SUCCESS';
export function manuallyAddDecision() {
  return (dispatch, getState) => {
    dispatch({
      type: MANUALLY_ADD_DECISION_REQUEST,
      loading: true,
      loadingMessage: 'Submitting...',
    });
    let decisions = generateDecisionSubmitData(
      getState().report.tables,

      getState().report.reportShown
    );
    let request_id = getState().report.request.requestId;
    let username = getState().user.username;
    let report = getState().report.reportShown;

    return axios
      .post(Config.API_ROOT + '/manuallyAddDecision', {
        data: {
          decisions,
          username,
          request_id,
          report,
        },
      })
      .then((response) => {
        dispatch({
          type: MANUALLY_ADD_DECISION_SUCCESS,

          message: 'Saved!',
        });
      })
      .catch((error) => {
        return dispatch({
          type: MANUALLY_ADD_DECISION_FAIL,
          message:
            'Decisions could not be saved due to an application error. Please reach out to IGO.',
          error: error,
        });
      });
  };
}

export const ATTACHMENT_DOWNLOAD_REQUEST = 'ATTACHMENT_DOWNLOAD_REQUEST';
export const ATTACHMENT_DOWNLOAD_FAIL = 'ATTACHMENT_DOWNLOAD_FAIL';
export const ATTACHMENT_DOWNLOAD_SUCCESS = 'ATTACHMENT_DOWNLOAD_SUCCESS';
export function downloadAttachment(attachmentRecordId, fileName) {
  return (dispatch, getState) => {
    dispatch({
      type: ATTACHMENT_DOWNLOAD_REQUEST,
      loading: true,
      loadingMessage: 'Fetching your data..',
    });
    return axios
      .get(Config.API_ROOT + '/qcReport/downloadAttachment', {
        params: {
          recordId: attachmentRecordId,
          fileName: fileName,
        },
        responseType: 'blob',
      })
      .then((response) => {
        console.log(response);

        dispatch({
          type: ATTACHMENT_DOWNLOAD_SUCCESS,
          message: 'reset',
          file: response.blob(),
          fileName: fileName,
        });
      })
      .catch((error) => {
        return dispatch({
          type: ATTACHMENT_DOWNLOAD_FAIL,
          error: error,

          loading: false,
        });
      });
  };
}

export const REPORT_DOWNLOAD_REQUEST = 'REPORT_DOWNLOAD_REQUEST';
export const REPORT_DOWNLOAD_FAIL = 'REPORT_DOWNLOAD_FAIL';
export const REPORT_DOWNLOAD_SUCCESS = 'REPORT_DOWNLOAD_SUCCESS';
export function downloadReport(reportShown, request) {
  return (dispatch, getState) => {
    let tableToExport = getState().report.tables[reportShown];
    let columnFeatures = getState().report.tables[reportShown].columnFeatures;
    let fileName =
      request.requestId + '_' + reportShown.replace(' ', '_') + '.xlsx';

    // deep copy and rename the data column names with the actual column headers
    // remove all html code
    let clonedReport = JSON.parse(
      JSON.stringify(tableToExport.data)
        .replace(/<\/?[^>]+>/gi, '')
        .replace(/&#8209;/gi, '')
    );
    for (let row in clonedReport) {
      for (let field in clonedReport[row]) {
        for (let columnFeature in columnFeatures) {
          if (field === columnFeatures[columnFeature].data) {
            clonedReport[row][columnFeatures[columnFeature].columnHeader] =
              clonedReport[row][field];
            delete clonedReport[row][field];
          }
        }
      }
    }

    const fileType =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';
    const ws = XLSX.utils.json_to_sheet(clonedReport);
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
    });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
  };
}

export const UPDATE_REPORT_SHOWN = 'UPDATE_REPORT_SHOWN';
export function updateReportShown(report) {
  return {
    type: UPDATE_REPORT_SHOWN,
    payload: report,
  };
}

// export const SHOW_PENDING = "SHOW_PENDING";
// export function showPending(ownProps) {
//     return {
//         type: SHOW_PENDING,
//         payload: "report"
//     };
// }

export const REGISTER_GRID_CHANGE = 'REGISTER_GRID_CHANGE';
export function registerChange(report) {
  return {
    type: REGISTER_GRID_CHANGE,
  };
}
