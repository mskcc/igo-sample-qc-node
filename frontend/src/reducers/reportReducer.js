import { reportActions as ActionTypes } from '../actions';
import FileSaver from 'file-saver';
import download from 'downloadjs';
import Swal from 'sweetalert2';

const initialState = {
  loaded: false,
  request: '',
  reportShown: null,
  pending: null,
  readOnly: true,
};

function reportReducer(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.CLEAR_REQUEST:
      return {
        ...initialState,
        request: { request_id: action.requestId },
        loaded: false,
      };
    case ActionTypes.REPORT_CLICK:
      return {
        ...state,
        reportShown: action.payload,
      };
    case ActionTypes.GET_REQUEST_REQUEST:
      return {
        ...initialState,
        request: { request_id: action.requestId },
        loaded: false,
      };
    case ActionTypes.GET_REQUEST_SUCCESS:
      return {
        ...state,
        request: action.payload.request,
        loaded: true,
      };

    case ActionTypes.GET_REQUEST_FAIL:
      Swal.fire({
        title: 'Request not found.',
        text:
          'This request might not exist, ' +
          'not be ready for QC or is not associated with your username.',
        type: 'info',
        animation: false,
        confirmButtonColor: '#007cba',
        confirmButtonText: 'Dismiss',
      });
      return {
        ...initialState,
        loaded: false,
      };

    case ActionTypes.GET_REPORT_SUCCESS:
      return {
        ...state,
        tables: action.payload.tables,
        reportShown: Object.keys(action.payload.tables)[0],
      };

    case ActionTypes.GET_REPORT_FAIL:
      Swal.fire({
        title: 'QC Reports not found.',
        text:
          'This request might not exist, ' +
          'not be ready for QC or is not associated with your username.',
        type: 'info',
        animation: false,
        confirmButtonColor: '#007cba',
        confirmButtonText: 'Dismiss',
      });
      return {
        ...initialState,
      };

    case ActionTypes.ATTACHMENT_DOWNLOAD_REQUEST:
      return {
        ...state,
      };

    case ActionTypes.ATTACHMENT_DOWNLOAD_SUCCESS:
      const file = new Blob([action.file], {
            type: 'application/pdf',
          });
      console.log(file);
      // const fileUrl = URL.createObjectURL(file);
      // download(fileUrl);
      FileSaver.saveAs(
        new Blob([action.file], {
          type: 'application/pdf',
        }),
        action.fileName
      );
      return {
        ...state,
      };

    case ActionTypes.ATTACHMENT_DOWNLOAD_FAIL:
      return {
        ...state,
      };

    case ActionTypes.REPORT_DOWNLOAD_REQUEST:
      return {
        ...state,
      };

    case ActionTypes.REPORT_DOWNLOAD_SUCCESS:
      return {
        ...state,
      };

    case ActionTypes.REPORT_DOWNLOAD_FAIL:
      return {
        ...state,
      };

    case ActionTypes.POST_INVESTIGATOR_DECISION_SUCCESS:
      return {
        ...state,
        readOnly: true,
        tables: action.payload,
      };
    case ActionTypes.POST_INVESTIGATOR_DECISION_FAIL:
      return {
        ...state,
        readOnly: false,
        tables: action.payload,
      };

    case ActionTypes.GET_PENDING_REQUEST:
      return {
        ...state,
      };

    case ActionTypes.GET_PENDING_SUCCESS:
      return {
        ...state,
        pending: action.pending,
      };

    case ActionTypes.GET_PENDING_FAIL:
      return {
        ...state,
      };
    case ActionTypes.UPDATE_REPORT_SHOWN:
      return {
        ...state,
        reportShown: action.payload,
      };

    case ActionTypes.REGISTER_GRID_CHANGE:
      return {
        ...state,
      };

    default:
      return state;
  }
}

export default reportReducer;
