import { REPORT_ACTION_TYPE } from "./ActionTypes";
import axios from "axios";

export default class ReportAction {
  static getAllIndividualStats = () => {
    return async (dispatch) => {
      try {
        const res = await axios.get(`/api/reports`);
        dispatch({
          type: REPORT_ACTION_TYPE.FETCH_PATIENTS_SUCCESS,
          payload: res.data
        });
      } catch (err) {
        dispatch({
          type: REPORT_ACTION_TYPE.FETCH_PATIENTS_FAILURE,
          payload: err.response.data
        });
      }
    };
  };

  static getAggregateSummaryByCategory = (category) => {
    return async (dispatch) => {
      try {
        const res = await axios.get(`/api/reports/category/${category}`);
        dispatch({
          type: REPORT_ACTION_TYPE.FETCH_AGGREGATE_SUCCESS,
          payload: {
            data: res.data,
            selectedCategory: category
          }
        });
      } catch (err) {
        dispatch({
          type: REPORT_ACTION_TYPE.FETCH_AGGREGATE_FAILURE,
          payload: err.response.data
        });
      }
    };
  };

  static closeAggregateSummaryPopup = () => {
    return {
      type: REPORT_ACTION_TYPE.CLOSE_POPUP,
      payload: []
    };
  };

  static setSearchText = searchText => {
    return {
      type: REPORT_ACTION_TYPE.SET_SEARCH_TEXT,
      payload: { searchText }
    };
  }
}
