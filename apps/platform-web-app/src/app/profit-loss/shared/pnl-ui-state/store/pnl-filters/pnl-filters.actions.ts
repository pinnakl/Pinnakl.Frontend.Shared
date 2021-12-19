import { createAction, props } from '@ngrx/store';

import { PnlFilter } from '../../../pnl-backend/pnl-calculated/pnl-calculated-filter.model';

export enum PnlFiltersActionTypes {
  HidePnlFilter = '[PnlFilters] Hide PnlFilter',
  TogglePnlFilter = '[PnlFilters] Toggle PnlFilter',
  SetPnlFilter = '[PnlFilters] Set PnlFilter',
  ShowPnlFilter = '[PnlFilters] Show PnlFilter'
}

export const HideFilter = createAction(
  PnlFiltersActionTypes.HidePnlFilter
);

export const ToggleFilter = createAction(
  PnlFiltersActionTypes.TogglePnlFilter
);

export const SetPnlFilter = createAction(
  PnlFiltersActionTypes.SetPnlFilter,
  props<{ payload: PnlFilter }>()
);

export const ShowFilter = createAction(
  PnlFiltersActionTypes.ShowPnlFilter
);
