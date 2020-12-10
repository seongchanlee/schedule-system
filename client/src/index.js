import React from "react";
import ReactDOM from "react-dom";
import App from "components/App";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import logger from "redux-logger";
import reduxThunk from "redux-thunk";
import reducers from "./reducers";
import * as serviceWorker from "./serviceWorker";
import "semantic-ui-css/semantic.min.css";
import axios from "axios";
import { AUTH_ACTION_TYPE } from "actions/ActionTypes";

const middlewares = process.env.NODE_ENV !== "production" ? [reduxThunk, logger] : [reduxThunk];
const store = createStore(reducers, {}, applyMiddleware(...middlewares));

// Add a response interceptor
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response.status === 401) {
      store.dispatch({
        type: AUTH_ACTION_TYPE.SESSION_EXPIRED,
        payload: {
          current_user: null,
          isFetching: false,
          hasLoggedIn: false
        }
      });
    }

    return Promise.reject(error);
  });

ReactDOM.render(
  <Provider store={store}>
      <App />
  </Provider>,
  document.querySelector("#root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
