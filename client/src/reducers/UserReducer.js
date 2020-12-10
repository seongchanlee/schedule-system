import { USER_ACTION_TYPE } from "actions/ActionTypes";

const initialState = {
  isFetching: false,
  filter: "all",
  searchText: "",
  sort: {
    keys: [],
    direction: "ascending"
  },
  items: [],
  popupUser: null,
  itemsDischarged:[],
  popupDischarged: false,
  err: null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case USER_ACTION_TYPE.STAFF_DELETE_REQUEST:
    case USER_ACTION_TYPE.ADMIN_DELETE_REQUEST:
    case USER_ACTION_TYPE.FETCH_DISCHARGED_PATIENTS_REQUEST:
    case USER_ACTION_TYPE.FETCH_REQUEST:
    case USER_ACTION_TYPE.PATIENT_DELETE_REQUEST:
    case USER_ACTION_TYPE.PATIENT_DISCHARGE_REQUEST: {
      return Object.assign({...state}, {isFetching: true}, action.payload);
    }
    case USER_ACTION_TYPE.FETCH_DISCHARGED_PATIENTS_FAILURE:
    case USER_ACTION_TYPE.FETCH_SUCCESS:
    case USER_ACTION_TYPE.FETCH_FAILURE:
    case USER_ACTION_TYPE.ADMIN_DELETE_FAILURE:
    case USER_ACTION_TYPE.PATIENT_DELETE_FAILURE:
    case USER_ACTION_TYPE.PATIENT_DISCHARGE_FAILURE: {
      return Object.assign({...state}, {isFetching: false}, action.payload);
    }
    case USER_ACTION_TYPE.FETCH_DISCHARGED_PATIENTS_SUCCESS:{
      return Object.assign({...state}, {isFetching:false, popupDischarged: true}, action.payload );
    }
    case USER_ACTION_TYPE.ADMIN_DELETE_SUCCESS:
    case USER_ACTION_TYPE.STAFF_DELETE_SUCCESS:
    case USER_ACTION_TYPE.PATIENT_DISCHARGE_SUCCESS:{
      var deleted = state.items.filter(user =>{
          return user.id !== action.payload}
      )
      return Object.assign({...state}, {isFetching: false, items: deleted});
    }
    case USER_ACTION_TYPE.PATIENT_DELETE_SUCCESS: {
      const deleted = state.itemsDischarged.filter(user =>{
          return user.User.id !== action.payload}
      )
      return Object.assign({...state}, {isFetching: false, itemsDischarged: deleted});
    }
    case USER_ACTION_TYPE.ADD_SUCCESS: {
      return Object.assign({...state}, { items: state.items.push(action.payload) });
    }
    case USER_ACTION_TYPE.EDIT_SUCCESS: {
      const items = state.items.map(user =>
        user.id === action.payload.id ? action.payload : user);
      return Object.assign({...state}, { items });
    }
    case USER_ACTION_TYPE.SET_SORT: {
      const { keys, direction } = state.sort;
      const isKeyListEqual = keys.every((key, index) => key === action.payload[index]);
      const newDirection = (!isKeyListEqual) ? "ascending" :
        (direction === "ascending" ? "descending" : "ascending");
      return Object.assign({...state}, { sort: { keys: action.payload, direction: newDirection } });
    }
    case USER_ACTION_TYPE.CLOSE_DISCHARGED_POPUP:
    case USER_ACTION_TYPE.OPEN_POPUP:
    case USER_ACTION_TYPE.CLOSE_POPUP:
    case USER_ACTION_TYPE.SET_FILTER:
    case USER_ACTION_TYPE.SET_SEARCH_TEXT: {
      return Object.assign({...state}, action.payload);
    }
    default:
      return state;
    }
};
