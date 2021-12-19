import { createAction, props } from '@ngrx/store';

import { PnlFilter } from '../../../../shared/pnl-backend/pnl-calculated/pnl-calculated-filter.model';

export enum PnlFiltersUiActionTypes {
  SetPnlFilterFromUi = '[PnlFiltersUi] Set PnlFilter from ui'
}

export const SetPnlFilterFromUi = createAction(
  PnlFiltersUiActionTypes.SetPnlFilterFromUi,
  props<{ payload: PnlFilter }>()
);
