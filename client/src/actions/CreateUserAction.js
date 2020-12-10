import { CREATE_USER_ACTION_TYPE } from "actions/ActionTypes";
import axios from "axios";
// new user // new admission record //
export default class CreateUserAction {

  static getPatient(mrn) {
    return async dispatch => {
      dispatch({
        type: CREATE_USER_ACTION_TYPE.FETCH_MRN_REQUEST,
        payload: {}
      });
      try {
        const res = await axios.get('/api/patients', {params: { mrn: mrn }});
        dispatch({
          type: CREATE_USER_ACTION_TYPE.FETCH_MRN_SUCCESS,
          payload:
            res.data
        });
      } catch (err) {
        dispatch({
          type: CREATE_USER_ACTION_TYPE.FETCH_MRN_FAILURE,
          payload: { error: err }
        });
      }
    };
  }

  static createPatient(data) {
    return async dispatch => {
      try {
        const res = await axios.post('/api/patients', data);
        dispatch({
          type: CREATE_USER_ACTION_TYPE.PATIENT_CREATE_SUCCESS,
          payload: res.data
        });
      } catch (err) {
        dispatch({
          type: CREATE_USER_ACTION_TYPE.PATIENT_CREATE_FAILURE,
          payload: { error: true }
        });
      }
    }
  };

  static createAdmissionRecord(data) {
    return async dispatch => {
      try {
        const res = await axios.post('/api/admission_records', data);
        dispatch({
          type: CREATE_USER_ACTION_TYPE.CREATE_ADMISSION_RECORD_SUCCESS,
          payload: res.data
        });
      } catch (err) {
        dispatch({
          type: CREATE_USER_ACTION_TYPE.CREATE_ADMISSION_RECORD_FAILURE,
          payload: { error: err }
        })
      }
    }
  };

  static createAdmin(data) {
    return async dispatch => {
      dispatch({
        type: CREATE_USER_ACTION_TYPE.ADMIN_CREATE_REQUEST,
        payload: {}
      });
      try {
        const res = await axios.post("/api/admins", data);
        dispatch({
          type: CREATE_USER_ACTION_TYPE.ADMIN_CREATE_SUCCESS,
          payload: res.data
        });
      } catch (err) {
        dispatch({
          type: CREATE_USER_ACTION_TYPE.ADMIN_CREATE_FAILURE,
          payload: {error: err}
        });
      }
    }
  }

   static createStaff(data) {
    return async dispatch => {
      dispatch({
        type: CREATE_USER_ACTION_TYPE.STAFF_CREATE_REQUEST,
        payload: {}
      });
      let res;
      try {
        res = await axios.post("/api/staffs", data);
        dispatch({
          type: CREATE_USER_ACTION_TYPE.STAFF_CREATE_SUCCESS,
          payload: res.data
        });
      } catch (err) {
        dispatch({
          type: CREATE_USER_ACTION_TYPE.STAFF_CREATE_FAILURE,
          payload: { error: err }
        });
      }
    }
  }

  static getUserByEmail(email) {
    return async dispatch => {
      dispatch({
        type: CREATE_USER_ACTION_TYPE.EMAIL_FETCH_REQUEST,
        payload: {}
      });
      try {
        const res = await axios.get('/api/users', {params: { email: email }});
        dispatch({
          type: CREATE_USER_ACTION_TYPE.EMAIL_FETCH_SUCCESS,
          payload:
             res.data
        });
      } catch (err) {
        dispatch({
          type: CREATE_USER_ACTION_TYPE.EMAIL_FETCH_FAILURE,
          payload: { error: err }
        });
      }
    }
  }

  static nextSlide(){
    return ({
      type: CREATE_USER_ACTION_TYPE.NEXT_SLIDE,
      payload:{}
    });
  }

  static prevSlide(){
    return ({
      type: CREATE_USER_ACTION_TYPE.PREV_SLIDE,
      payload:{}
    });
  }
  static closePopup(){
    return dispatch => dispatch({
      type: CREATE_USER_ACTION_TYPE.CLOSE_POPUP,
      payload:{}
    });
  }
  static openPopup() {
    return dispatch => dispatch({
      type: CREATE_USER_ACTION_TYPE.OPEN_POPUP,
      payload:{}
    });
  }

  static selectUser(user){
    return ({
      type: CREATE_USER_ACTION_TYPE.SELECT_USER,
      payload:user
    })
  }
}
