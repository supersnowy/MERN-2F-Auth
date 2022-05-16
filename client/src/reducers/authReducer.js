import { SET_CURRENT_USER, USER_LOADING, SET_2FA_QR, SET_SIGN } from "../actions/types";

// const isEmpty = require("is-empty");

const initialState = {
  isAuthenticated: false,
  user: {},
  loading: false,
  email: '',
  qr: '',
  secret: ''
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_CURRENT_USER:
      return {
        ...state,
        isAuthenticated: false,
        user: action.payload
      };
    case USER_LOADING:
      return {
        ...state,
        loading: true
      };
    case SET_2FA_QR:
      return {
        ...state,
        email: action.payload.email,
        qr: action.payload.qr,
        secret: action.payload.secret
      };
    case SET_SIGN:
      return {
        ...state,
        isAuthenticated: true
      };
    default:
      return state;
  }
}
