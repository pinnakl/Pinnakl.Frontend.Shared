import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';

import { UpdatePositionsReportSelectedColumns } from '../positions-report-selected-column/positions-report-selected-column.actions';
import {
  UpdateGroupOrders,
  UpdateSortOrders,
  UpdateViewOrders
} from './positions-grid.actions';

@Injectable()
export class PositionsGridEffects {
  updateGroupOrders$ = createEffect(() => this._actions$.pipe(
    ofType(UpdateGroupOrders),
    map((v) => {
      const groupOrdersChanged = v.groupOrders.map(go => {
        const { name, reportingColumnType } = v.selectedColumns.find(
          ({ caption, name: n }) => n === go.name || caption === go.name
        );
        return { ...go, name, reportingColumnType };
      });
      const groupOrdersRemoved = v.selectedColumns
        .filter(
          ({ caption, groupOrder, name }) =>
            groupOrder &&
            v.groupOrders.some(go => go.name === name || go.name === caption)
        )
        .map(({ name, reportingColumnType }) => ({
          groupOrder: null,
          name,
          reportingColumnType
        }));
      return UpdatePositionsReportSelectedColumns({
        positionsReportSelectedColumns: [
          ...groupOrdersChanged,
          ...groupOrdersRemoved
        ]
      });
    })
  ));

  updateSortOrders$ = createEffect(() => this._actions$.pipe(
    ofType(UpdateSortOrders),
    map(({ sortOrders, selectedColumns }) => ({ sortOrders, selectedColumns })),
    map(({ selectedColumns, sortOrders }) => {
      const sortOrdersChanged = sortOrders.map(so => {
        const { name, reportingColumnType } = selectedColumns.find(
          ({ caption, name: n }) => n === so.name || caption === so.name
        );
        return { ...so, name, reportingColumnType };
      });
      const sortOrdersRemoved = selectedColumns
        .filter(
          ({ caption, sortOrder, name }) =>
            sortOrder &&
            !sortOrders.some(so => so.name === name || so.name === caption)
        )
        .map(({ name, reportingColumnType }) => ({
          name,
          reportingColumnType,
          sortAscending: null,
          sortOrder: null
        }));
      return UpdatePositionsReportSelectedColumns({
        positionsReportSelectedColumns: [
          ...sortOrdersChanged,
          ...sortOrdersRemoved
        ]
      });
    })
  ));

  updateViewOrders$ = createEffect(() => this._actions$.pipe(
    ofType(UpdateViewOrders),
    map(({ selectedColumns, viewOrders }) => ({ selectedColumns, viewOrders })),
    map(({ selectedColumns, viewOrders }) => {
      const viewOrdersChanged = viewOrders.map(vo => {
        const columnFromSelected = selectedColumns.find(
          ({ caption, name: n }) => n === vo.name || caption === vo.name
        );
        if (columnFromSelected) {
          const { name, reportingColumnType } = columnFromSelected;
          return { ...vo, name, reportingColumnType };
        }
        return vo;
      });
      const viewOrdersRemoved = selectedColumns
        .filter(
          ({ caption, viewOrder, name }) =>
            viewOrder !== -1 &&
            !viewOrders.some(vo => vo.name === name || vo.name === caption)
        )
        .map(({ name, reportingColumnType }) => ({
          include: false,
          name,
          reportingColumnType,
          viewOrder: -1
        }));
      return UpdatePositionsReportSelectedColumns({
        positionsReportSelectedColumns: [
          ...viewOrdersChanged,
          ...viewOrdersRemoved
        ]
      });
    })
  ));

  constructor(private readonly _actions$: Actions) { }
}
