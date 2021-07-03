import { useReducer } from 'react';

export const AppAction = {
  TEST: 'test'
};

const AppReducer = (state, action) => {
  switch(action.type) {
    case AppAction.TEST:
      return {
        ...state,
        test: true
      };
    default:
      return state;
  }
};

const initialState = {
  test: false,
};

export const useAppReducer = () => useReducer(AppReducer, initialState);
