import { userActions as ActionTypes } from '../actions';

// mockuser can be used for testing from a user account!
// just uncomment the return statments in the reducer below
const mockUser = {
  loggedIn: true,
  username: 'chadhap',
  fullName: 'Firstname Lastname',
  role: 'user',
  groups: 'zzPDL_IGO_Staff',
  title: 'Research Assistant'
};

const initialState = {
  loggedIn: false,
};

function userReducer(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.FETCH_USER_SUCCESS: 
      return {
          ...state,
          ...mockUser
        }
      
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
          loggedIn: true,
          username: action.user.payload.username,
          role: role,
      };
  

    default:
      // return state;
      return {
        ...mockUser
      }
  }
}
export default userReducer;
