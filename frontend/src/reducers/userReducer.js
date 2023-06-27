import { userActions as ActionTypes } from '../actions';
import { reportActions as ReportActionTypes } from '../actions';
const initialState = {
  loggedIn: false,
};

function userReducer(state = initialState, action) {
  switch (action.type) {
    case ReportActionTypes.EXPIRED:
      return {
        ...initialState,
      };
    case ActionTypes.LOGIN_REQUEST:
      return {
        ...state,
      };
    case ActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        loggedIn: true,
        username: action.payload.username,
        role: action.payload.role,
        title: action.payload.title,
        fullName: action.payload.full_name,
      };

    case ActionTypes.LOGIN_FAIL:
      return {
        ...state,
        loggedIn: false,
      };

    default:
      return state;
  }
}
export default userReducer;
