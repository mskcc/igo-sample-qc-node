import {
  communicationActions as ActionTypes,
  reportActions as ReportActionTypes,
} from '../actions';

const initialState = {
  comments: [],
  recipients: [],
};

function commentReducer(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.ADD_COMMENT_SUCCESS:
      // Hacky but efficient and less painful to implement than anywhere else
      document.getElementById('new-comment-field').value = '';
      return {
        ...state,
        comments: action.payload,
      };

    case ActionTypes.ADD_COMMENT_FAIL:
      return {
        ...state,
      };

    case ActionTypes.ADD_COMMENT_TO_ALL_SUCCESS:
      // Hacky but efficient and less painful to implement than anywhere else
      document.getElementById('new-comment-field').value = '';
      return {
        ...state,
        comments: action.payload,
      };

    case ActionTypes.ADD_COMMENT_TO_ALL_FAIL:
      return {
        ...state,
      };

    case ActionTypes.ADD_INITIAL_COMMENT_SUCCESS:
      return {
        ...state,
        comments: action.payload,
      };

    case ActionTypes.ADD_INITIAL_COMMENT_FAIL:
      return {
        ...state,
      };

    case ActionTypes.GET_COMMENTS_SUCCESS:
      return {
        ...state,
        comments: action.payload,
      };

    case ActionTypes.GET_COMMENTS_FAIL:
      return {
        ...state,
        comments: [],
      };

    case ReportActionTypes.GET_REQUEST_SUCCESS:
      return {
        ...state,
        recipients: action.payload.recipients,
      };

    case ActionTypes.SET_RECIPIENTS:
      return {
        ...state,
        recipients: action.payload,
      };

    default:
      return state;
  }
}

export default commentReducer;
