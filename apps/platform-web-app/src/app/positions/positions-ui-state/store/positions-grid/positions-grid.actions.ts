import { createAction, props } from '@ngrx/store';

import { ReportingColumn } from '@pnkl-frontend/shared';

export enum PositionsGridActionTypes {
  UpdateGroupOrders = '[PositionsGrid] Update Group Orders',
  UpdateSortOrders = '[PositionsGrid] Update Sort Orders',
  UpdateViewOrders = '[PositionsGrid] Update View Orders'
}

export const UpdateGroupOrders = createAction(
  PositionsGridActionTypes.UpdateGroupOrders,
  props<{
    groupOrders: { groupOrder: number; name: string }[];
    selectedColumns: ReportingColumn[];
  }>()
);

export const UpdateSortOrders = createAction(
  PositionsGridActionTypes.UpdateSortOrders,
  props<{
    sortOrders: { name: string; sortAscending: boolean; sortOrder: number }[];
    selectedColumns: ReportingColumn[];
  }>()
);

export const UpdateViewOrders = createAction(
  PositionsGridActionTypes.UpdateViewOrders,
  props<{
    viewOrders: { name: string; viewOrder: number }[];
    selectedColumns: ReportingColumn[];
  }>()
);
