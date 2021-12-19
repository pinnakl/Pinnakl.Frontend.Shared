import { createAction, props } from '@ngrx/store';
import { ReportingColumn } from '@pnkl-frontend/shared';

export enum PositionsFilterActionTypes {
  ApplyPositionsFilter = '[PositionsFilter] Apply PositionsFilters'
}

export const ApplyPositionsFilter = createAction(
  PositionsFilterActionTypes.ApplyPositionsFilter,
  props<{ idcColumnsAdded: ReportingColumn[] }>()
);
