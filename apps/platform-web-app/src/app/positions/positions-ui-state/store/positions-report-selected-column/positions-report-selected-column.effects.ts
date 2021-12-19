import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ActionCreator, Store } from '@ngrx/store';
import { Observable, zip } from 'rxjs';
import { map, mergeMap, switchMap, take } from 'rxjs/operators';

import { AccountsBackendStateFacade } from '@pnkl-frontend/shared';
import {
  ClientReportColumn,
  ReportingColumn,
  UserReportColumn,
  UserReportCustomAttribute,
  UserReportIdcColumn
} from '@pnkl-frontend/shared';
import {
  LoadClientReportColumns
} from '../../../positions-backend-state/store/client-report-column/client-report-column.actions';
import {
  LoadUserReportColumns
} from '../../../positions-backend-state/store/user-report-column/user-report-column.actions';
import { LoadUserReportCustomAttributes } from '../../../positions-backend-state/store/user-report-custom-attribute-column/user-report-custom-attribute.actions';
import { LoadUserReportIdcColumns } from '../../../positions-backend-state/store/user-report-idc-column/user-report-idc-column.actions';
import { selectAllPositionReportSelectedColumns } from '../index';
import {
  LoadPositionsReportSaveSelectedColumns
} from '../positions-report-save-selected-column/positions-report-save-selected-column.actions';
import {
  LoadPositionsReportSelectedColumns,
  PositionsReportSelectedColumnActionTypes,
  UpdatePositionsReportSelectedColumns
} from './positions-report-selected-column.actions';

@Injectable()
export class PositionsReportSelectedColumnEffects {
  loadClientReportColumns$ = createEffect(() => this._actions$.pipe(
    ofType(LoadClientReportColumns),
    map(action => this._getReportingColumnsFromClientReportColumns(action.clientReportColumns)),
    switchMap(clientReportColumns => [
      LoadPositionsReportSaveSelectedColumns({ positionsReportSelectedColumns: clientReportColumns }),
      LoadPositionsReportSelectedColumns({ positionsReportSelectedColumns: clientReportColumns })
    ])
  ));

  // Check _getActionPayload work in comparasion with develop branch.
  loadUserReportColumns$ = createEffect(() => zip(
    this._getActionPayload<UserReportColumn[]>(
      LoadUserReportColumns,
      'userReportColumns'
    ),
    this._getActionPayload<UserReportCustomAttribute[]>(
      LoadUserReportCustomAttributes,
      'userReportCustomAttributes'
    ),
    this._getActionPayload<UserReportIdcColumn[]>(
      LoadUserReportIdcColumns,
      'userReportIdcColumns'
    )
  ).pipe(
    switchMap(
      ([userReportColumns, userReportCustomAttributes, userReportIdcColumns]) =>
        [
          LoadPositionsReportSelectedColumns({
            positionsReportSelectedColumns: [
              ...this._getReportingColumnsFromUserReportColumns(
                userReportColumns
              ),
              ...this._getReportingColumnsFromUserReportCustomAttributes(
                userReportCustomAttributes
              ),
              ...this._getReportingColumnsFromUserReportIdcColumns(
                userReportIdcColumns
              )
            ]
          }),
          LoadPositionsReportSaveSelectedColumns({
            positionsReportSelectedColumns: [
              ...this._getReportingColumnsFromUserReportColumns(
                userReportColumns
              ),
              ...this._getReportingColumnsFromUserReportCustomAttributes(
                userReportCustomAttributes
              ),
              ...this._getReportingColumnsFromUserReportIdcColumns(
                userReportIdcColumns
              )
            ]
          })
        ]
    )
  ));

  // We have to handle the case when user add column and then change its position and then add one more
  onColumnAdd$ = createEffect(() => this._actions$.pipe(
    ofType(PositionsReportSelectedColumnActionTypes.AddPositionsReportSelectedColumns),
    mergeMap(() => this._store.select(selectAllPositionReportSelectedColumns)
      .pipe(take(1), map(cols => LoadPositionsReportSaveSelectedColumns({     positionsReportSelectedColumns: cols   }))))
  ));

  selectDefault$ = createEffect(() => this._actions$.pipe(
    ofType(
      PositionsReportSelectedColumnActionTypes.SelectDefaultPositionsReportSelectedColumns
    ),
    map(() => {
      const { mostImportantAccount } = this._accountsBackendStateFacade;
      return UpdatePositionsReportSelectedColumns({
        positionsReportSelectedColumns: [
          {
            name: 'AccountCode',
            filters: [mostImportantAccount.accountCode.toUpperCase()],
            reportingColumnType: 'report'
          },
          {
            name: 'AssetType',
            filters: ['EQUITY', 'FUND', 'OPTION'],
            reportingColumnType: 'report'
          }
        ]
      });
    })
  ));

  private _getActionPayload<U>(
    action: ActionCreator,
    payloadPropertyName: string
  ): Observable<U> {
    return this._actions$.pipe(
      ofType(action),
      map(payload => payload[payloadPropertyName])
    );
  }

  private _getReportingColumnFromClientReportColumn({
    clientReportId,
    filterValues: filters,
    id,
    reportColumnId: dbId,
    ...crc
  }: ClientReportColumn): ReportingColumn {
    return {
      ...crc,
      convertToBaseCurrency: false,
      dbId,
      filters,
      include: crc.viewOrder !== -1,
      renderingFunction: null,
      reportingColumnType: 'report',
      formula: null
    };
  }

  private _getReportingColumnFromUserReportColumn({
    filterValues: filters,
    id: dbId,
    reportColumnId,
    userReportId,
    ...urc
  }: UserReportColumn): ReportingColumn {
    return {
      ...urc,
      convertToBaseCurrency: false,
      dbId,
      filters,
      include: urc.viewOrder !== -1,
      reportingColumnType: 'report'
    };
  }

  private _getReportingColumnFromUserReportCustomAttribute({
    customAttributeId,
    filterValues: filters,
    id: dbId,
    userReportId,
    ...urca
  }: UserReportCustomAttribute): ReportingColumn {
    return {
      ...urca,
      caption: urca.name,
      convertToBaseCurrency: false,
      dbId,
      decimalPlaces: null,
      filters,
      include: urca.viewOrder !== -1,
      renderingFunction: null,
      reportingColumnType: 'ca',
      formula: null
    };
  }

  private _getReportingColumnFromUserReportIdcColumn({
    filterValues: filters,
    id: dbId,
    idcColumnId,
    userReportId,
    ...uridc
  }: UserReportIdcColumn): ReportingColumn {
    return {
      ...uridc,
      convertToBaseCurrency: false,
      dbId,
      decimalPlaces: null,
      filters,
      include: uridc.viewOrder !== -1,
      renderingFunction: null,
      reportingColumnType: 'idc',
      formula: null
    };
  }

  private _getReportingColumnsFromClientReportColumns(
    entities: ClientReportColumn[]
  ): ReportingColumn[] {
    return entities.map(this._getReportingColumnFromClientReportColumn);
  }

  private _getReportingColumnsFromUserReportColumns(
    entities: UserReportColumn[]
  ): ReportingColumn[] {
    return entities.map(this._getReportingColumnFromUserReportColumn);
  }

  private _getReportingColumnsFromUserReportCustomAttributes(
    entities: UserReportCustomAttribute[]
  ): ReportingColumn[] {
    return entities.map(this._getReportingColumnFromUserReportCustomAttribute);
  }

  private _getReportingColumnsFromUserReportIdcColumns(
    entities: UserReportIdcColumn[]
  ): ReportingColumn[] {
    return entities.map(this._getReportingColumnFromUserReportIdcColumn);
  }

  constructor(
    private readonly _store: Store,
    private readonly _actions$: Actions,
    private readonly _accountsBackendStateFacade: AccountsBackendStateFacade
  ) { }
}
