import { APPOINTMENT_ACTION_TYPE } from "actions/ActionTypes";
import axios from "axios";

export default class CalendarAction {

  static fetchAppointments = (user) => {
    return async dispatch => {
      try {
        const res = await axios.get(`/api/appointments/`, {
          params: { user_id: user.id }
        });

        dispatch({
          type: APPOINTMENT_ACTION_TYPE.FETCH_SUCCESS,
          payload: {
            events: res.data,
            selectedUser: user
          }
        });
      } catch (err) {
        dispatch({
          type: APPOINTMENT_ACTION_TYPE.FETCH_FAILURE,
          payload: {
            err: err
          }
        });
      }
    }
  };

  static createAppointment = data => {
    return async dispatch => {
      try {
        const res = await axios.post(`/api/appointments/`, data);
        dispatch({
          type: APPOINTMENT_ACTION_TYPE.CREATE_SUCCESS,
          payload: res.data
        });
      } catch (err) {
        dispatch({
          type: APPOINTMENT_ACTION_TYPE.CREATE_FAILURE,
          payload: err.response.data
        });
      }
    }
  };

  static updateAppointment = data => {
    return async dispatch => {
      try {
        const res = await axios.put(`/api/appointments/${data.id}`, data);
        dispatch({
          type: APPOINTMENT_ACTION_TYPE.UPDATE_SUCCESS,
          payload: res.data
        });
      } catch (err) {
        dispatch({
          type: APPOINTMENT_ACTION_TYPE.UPDATE_FAILURE,
          payload: err.response.data
        });
      }
    }
  };

  static deleteAppointment = appointmentId => {
    return async dispatch => {
      try {
        await axios.delete(`/api/appointments/${appointmentId}`);
        dispatch({
          type: APPOINTMENT_ACTION_TYPE.DELETE_SUCCESS,
          payload: {id: appointmentId}
        });
      } catch (err) {
        dispatch({
          type: APPOINTMENT_ACTION_TYPE.DELETE_FAILURE,
          payload: err.response.data
        });
      }
    }
  };

  static resetErrorMessage = () => {
      return { type: APPOINTMENT_ACTION_TYPE.ERROR_MESSAGE_RESET };
  }
}