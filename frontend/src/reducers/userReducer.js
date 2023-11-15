import { reportActions as ReportActionTypes } from '../actions';
const mockUser = {
  loggedIn: true,
  username: 'lawala',
  fullName: 'Fname Lname',
  role: 'lab_member',
  groups: 'zzPDL_IGO_Staff'
};

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
      // return state;
      return {
        ...mockUser
      }
  }
}
export default userReducer;
