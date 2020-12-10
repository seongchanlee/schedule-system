import { REPORT_ACTION_TYPE } from "../actions/ActionTypes";

const initialState = {
  patients: [],
  errorMessage: {},
  searchText: "",
  categorySummary: [],
  isAggregateOpen: false,
  selectedCategory: -1
};

export default (state = initialState, action) => {
  switch (action.type) {
    case REPORT_ACTION_TYPE.FETCH_PATIENTS_SUCCESS:{
      return Object.assign({...state}, { searchText: "", patients: action.payload });
    }

    case REPORT_ACTION_TYPE.FETCH_PATIENTS_FAILURE:{
      return Object.assign({...state}, { errorMessage: action.payload });
    }

    case REPORT_ACTION_TYPE.SET_SEARCH_TEXT: {
      return Object.assign({...state}, action.payload);
    }

    case REPORT_ACTION_TYPE.FETCH_AGGREGATE_SUCCESS: {
      const { selectedCategory } = action.payload
      return Object.assign(
        {...state},
        { categorySummary: action.payload.data, isAggregateOpen: true, selectedCategory}
      );
    }

    case REPORT_ACTION_TYPE.CLOSE_POPUP: {
      return Object.assign(
        {...state},
        {categorySummary: [], isAggregateOpen: false, selectedCategory: -1}
      );
    }
    default:
      return state;
  }
};
