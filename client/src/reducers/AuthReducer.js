import { AUTH_ACTION_TYPE, USER_ACTION_TYPE } from "actions/ActionTypes";

const initialState = {
  current_user: null,
  hasLoggedIn: false,
  isFetching: false,
  err: null
}

export default (state = initialState, action) => {
    switch(action.type) {
        case AUTH_ACTION_TYPE.LOGIN_REQUEST:
        case AUTH_ACTION_TYPE.LOGIN_SUCCESS:
        case AUTH_ACTION_TYPE.LOGIN_FAILURE:
        case AUTH_ACTION_TYPE.LOGOUT_REQUEST:
        case AUTH_ACTION_TYPE.LOGOUT_SUCCESS:
        case AUTH_ACTION_TYPE.LOGOUT_FAILURE:
        case AUTH_ACTION_TYPE.SESSION_EXPIRED:
          return Object.assign({...state}, action.payload);
        case USER_ACTION_TYPE.EDIT_SUCCESS:{
          if (state.current_user.id !== action.payload.id)
            return state;
          return Object.assign({...state}, {current_user: action.payload});
        }

        default:
            return state;
    }
}