import { reportActions as ReportActionTypes } from '../actions';
import { userActions as ActionTypes } from '../actions';
const mockUser = {
  loggedIn: true,
  username: 'lawala',
  fullName: 'Fname Lname',
  role: 'user',
  groups: 'zzPDL_IGO_Staff',
  title: 'Research Assistant'
};

const initialState = {
  loggedIn: false,
};

function userReducer(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.FETCH_USER_SUCCESS: {
      // return {
      //     ...state,
      //     ...mockUser
      //   }
      
      let user = action.user.payload;
      let role;
      if (user.isLabMember) {
          role = 'lab_member';
      } else if (user.isPM) {
          role = 'cmo_pm';
      } else {
          role = 'user';
      }
      return {
          ...state,
          ...user,
          username: action.user.payload.username,
          role: role,
      };
  }
    case ReportActionTypes.EXPIRED:
      return {
        ...initialState,
      };

    default:
      return state;
      // return {
      //   ...mockUser
      // }
  }
}
export default userReducer;
