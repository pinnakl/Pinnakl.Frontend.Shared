import { createAction, props } from '@ngrx/store';

import { Account } from '@pnkl-frontend/shared';

export enum PositionsHomeSelectedAccountTypes {
  SetSelectedAccountsWithoutAum = '[SetSelectedAccount] Set Selected Accounts without aum',
}

export const SetSelectedAccountsWithoutAum = createAction(
  PositionsHomeSelectedAccountTypes.SetSelectedAccountsWithoutAum,
  props<{ payload: Account[] }>()
);
