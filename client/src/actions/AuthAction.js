import { AUTH_ACTION_TYPE } from "actions/ActionTypes";
import axios from "axios";

const sleep = (ms) =>
  new Promise(resolve => setTimeout(resolve, ms));

export default class AuthAction {
  static checkUser = () => {
    return async (dispatch) => {
      dispatch({
        type: AUTH_ACTION_TYPE.LOGIN_REQUEST,
        payload: { isFetching: true }
      });
      let res;
      await sleep(1000);
      try {
        res = await axios.get("/api/user/session");
        dispatch({
          type: AUTH_ACTION_TYPE.LOGIN_SUCCESS,
          payload: {
            current_user: res.data,
            isFetching: false,
            hasLoggedIn: true
          }
        });
      } catch (err) {
        dispatch({
          type: AUTH_ACTION_TYPE.LOGIN_FAILURE,
          payload: { err, isFetching: false }
        });
      }
    };
  };

  static loginUser = ({ username, password }) => {
    return async (dispatch) => {
      dispatch({
        type: AUTH_ACTION_TYPE.LOGIN_REQUEST,
        payload: { isFetching: true }
      });
      let res;
      await sleep(1000);
      try {
        res = await axios.post("/api/user/session", {
          username: username,
          password: password
        });
        dispatch({
          type: AUTH_ACTION_TYPE.LOGIN_SUCCESS,
          payload: {
            current_user: res.data,
            isFetching: false,
            hasLoggedIn: true
          }
        });
      } catch (err) {
        dispatch({
          type: AUTH_ACTION_TYPE.LOGIN_FAILURE,
          payload: {
            err: err.response.data,
            isFetching: false
          }
        });
      }
    };
  };

  static logoutUser = (history) => {
    return async (dispatch) => {
      dispatch({
        type: AUTH_ACTION_TYPE.LOGOUT_REQUEST,
        payload: { isFetching: true }
      });
      try {
        await axios.delete("/api/user/session");
        dispatch({
          type: AUTH_ACTION_TYPE.LOGOUT_SUCCESS,
          payload: {
            current_user: null,
            isFetching: false,
            hasLoggedIn: false
          }
        });
        history.push("/login");
      } catch (err) {
        dispatch({
          type: AUTH_ACTION_TYPE.LOGOUT_FAILURE,
          payload: { err, isFetching: false }
        });
      }
    };
  };
}
