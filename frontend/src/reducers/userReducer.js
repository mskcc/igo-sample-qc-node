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

    default:
      return state;
  }
}
export default userReducer;
