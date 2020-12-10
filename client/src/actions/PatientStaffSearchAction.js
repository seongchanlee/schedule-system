import { PATIENT_STAFF_SEARCH_ACTION_TYPE } from "actions/ActionTypes";
import axios from "axios";

export default class PatientStaffSearchAction {
  static getPatientAndStaff() {
    return async dispatch => {
      try {
        const res = await axios.get("/api/users");
        dispatch({
          type: PATIENT_STAFF_SEARCH_ACTION_TYPE.FETCH_SUCCESS,
          payload: {
            items: res.data
          }
        });
      } catch (err) {
        dispatch({
          type: PATIENT_STAFF_SEARCH_ACTION_TYPE.FETCH_FAILURE,
          payload: {
            err: err
          }
        });
      }
    };
  }
}