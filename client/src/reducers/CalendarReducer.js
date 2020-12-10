import { APPOINTMENT_ACTION_TYPE } from "actions/ActionTypes";

const defaultErrorMessage = { errorMessage : { status: false } };
const initialState = {
  events: [],
  selectedUser: {},
  errorMessage: defaultErrorMessage.errorMessage
};

export default (state = initialState, action) => {
  switch (action.type) {
    case APPOINTMENT_ACTION_TYPE.FETCH_SUCCESS: {
      return Object.assign({...state}, {...action.payload}, defaultErrorMessage);
    }

    case APPOINTMENT_ACTION_TYPE.CREATE_SUCCESS: {
      return Object.assign({...state},
        { events: [...state.events, action.payload] },
        defaultErrorMessage
      );
    }

    case APPOINTMENT_ACTION_TYPE.UPDATE_SUCCESS: {
      const updatedEvents = state.events.map(event => event.id === action.payload.id ? action.payload : event);
      return Object.assign({...state},
        { events: updatedEvents },
        defaultErrorMessage
      );
    }

    case APPOINTMENT_ACTION_TYPE.DELETE_SUCCESS: {
      const filteredEvents = state.events.filter(event => event.id !== action.payload.id);
      return Object.assign({...state},
        { events: filteredEvents },
        defaultErrorMessage
      );
    }

    case APPOINTMENT_ACTION_TYPE.FETCH_FAILURE:
    case APPOINTMENT_ACTION_TYPE.CREATE_FAILURE:
    case APPOINTMENT_ACTION_TYPE.UPDATE_FAILURE:
    case APPOINTMENT_ACTION_TYPE.DELETE_FAILURE: {
      return Object.assign({...state}, {...action.payload});
    }

    case APPOINTMENT_ACTION_TYPE.ERROR_MESSAGE_RESET: {
      return Object.assign({...state}, defaultErrorMessage);
    }

    default:
      return state;
    }
};