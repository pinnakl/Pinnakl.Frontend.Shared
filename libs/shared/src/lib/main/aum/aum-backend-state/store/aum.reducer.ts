import { AumActions, AumActionTypes } from './aum.actions';

export interface State {
  accountId?: number;
  aum?: number;
  date?: Date;
}

export const initialState: State = {};

export function reducer(
  state: State = initialState,
  action: AumActions
): State {
  switch (action.type) {
    case AumActionTypes.AttemptLoadAum:
      const { accountId, date } = action.payload;
      return {
        accountId,
        date
      };
    case AumActionTypes.LoadAum:
      const { aum } = action.payload;
      return {
        ...state,
        aum
      };
    default:
      return state;
  }
}

export function accountsReducer(
  state: State[] = [],
  action: AumActions
): State[] {
  switch (action.type) {
    case AumActionTypes.LoadAccountsAum:
      return [...action.payload];
    default:
      return state;
  }
}
