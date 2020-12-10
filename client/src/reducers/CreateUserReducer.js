 import { CREATE_USER_ACTION_TYPE } from "actions/ActionTypes";

const initialState = {
  isFetching: false,
  slideIndex:0,
  user:[],
  typeUser:'',
  isExisting: false,
  popup: false,
  created:false,
  error: false,
};

export default (state = initialState, action) => {
  const {slideIndex, user, isExisting} = state;
  switch (action.type) {
    case CREATE_USER_ACTION_TYPE.STAFF_CREATE_REQUEST:
    case CREATE_USER_ACTION_TYPE.EMAIL_FETCH_REQUEST:
    case CREATE_USER_ACTION_TYPE.ADMIN_CREATE_REQUEST:
    case CREATE_USER_ACTION_TYPE.FETCH_MRN_REQUEST: {
      return Object.assign({...state}, {isFetching: true});
    }
    case CREATE_USER_ACTION_TYPE.SELECT_USER:{
      return Object.assign({...state}, {typeUser: action.payload, popup: false, slideIndex: 1});
    }
    case CREATE_USER_ACTION_TYPE.FETCH_MRN_SUCCESS:{
      const exists = action.payload.length > 0 ? true : false;
      const index = exists ? 3 : 2;
      return Object.assign({...state}, {isFetching: false, isExisting: exists, slideIndex: index, user: action.payload});
    }
    case CREATE_USER_ACTION_TYPE.EMAIL_FETCH_SUCCESS:{
      const error = action.payload.length !== 0;
      return Object.assign({...state}, {user:action.payload, error: error});
    }
    case CREATE_USER_ACTION_TYPE.FETCH_MRN_FAILURE:{
      return Object.assign({...state}, {isFetching: false});
    }
    case CREATE_USER_ACTION_TYPE.NEXT_SLIDE: {
      return Object.assign({...state}, {slideIndex: slideIndex + 1});
    }
    case CREATE_USER_ACTION_TYPE.PREV_SLIDE: {
      const index = isExisting ? slideIndex - 2 : slideIndex - 1;
      if(index === 0) return {...initialState, popup: true};
      if(index === 1) return Object.assign({...state}, {isExisting: false, error: false, slideIndex: index});
      return Object.assign({...state}, {error: false, slideIndex: index});
    }
    case CREATE_USER_ACTION_TYPE.CLOSE_POPUP: {
      return initialState;
    }
    case CREATE_USER_ACTION_TYPE.OPEN_POPUP: {
      return Object.assign({...state}, {popup: true});
    }
    case CREATE_USER_ACTION_TYPE.STAFF_CREATE_FAILURE:
    case CREATE_USER_ACTION_TYPE.EMAIL_FETCH_FAILURE:
    case CREATE_USER_ACTION_TYPE.ADMIN_CREATE_FAILURE:
    case CREATE_USER_ACTION_TYPE.PATIENT_CREATE_FAILURE:
    case CREATE_USER_ACTION_TYPE.CREATE_ADMISSION_RECORD_FAILURE: {
      let message;
      const errorData = action.payload.error.response.data;
      if(errorData.code ==='ER_DUP_ENTRY') {
        user[0] = [];
        errorData.message = "User with requested email already exists."
      }
      return Object.assign({...state}, {user: user}, {error: {
        message: errorData.message || message}
      });
    }
    case CREATE_USER_ACTION_TYPE.STAFF_CREATE_SUCCESS:
    case CREATE_USER_ACTION_TYPE.ADMIN_CREATE_SUCCESS:
    case CREATE_USER_ACTION_TYPE.CREATE_ADMISSION_RECORD_SUCCESS:
    case CREATE_USER_ACTION_TYPE.PATIENT_CREATE_SUCCESS: {
      return Object.assign({...state},{created: true, slideIndex: 4});
    }
    default:
      return state;
    }
};