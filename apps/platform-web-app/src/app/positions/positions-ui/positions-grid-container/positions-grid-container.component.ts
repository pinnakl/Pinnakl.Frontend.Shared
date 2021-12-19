import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { Store } from '@ngrx/store';

import { ICellRendererParams } from 'ag-grid-community';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { PositionHomeService } from '../position-home/position-home.service';

import { PinnaklColDef, ReportingColumn } from '@pnkl-frontend/shared';
import { UpdatePositionsReportData } from '../../positions-backend-state/store/positions-report-data/positions-report-data.actions';
import { PositionsUiStateFacade } from '../../positions-ui-state/positions-ui-state-facade.service';
import { UpdatePositionsColumnsFilteredValues } from '../../positions-ui-state/store/positions-columns-filtered-values/positions-columns-filtered-values.actions';
import { PositionsGridComponent } from '../positions-grid/positions-grid.component';

@Component({
  selector: 'positions-grid-container',
  templateUrl: './positions-grid-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PositionsGridContainerComponent implements OnInit, OnChanges {
  @Input() searchText = '';
  @Input() rebalanceVisible = false;
  @Input() gridHeight = {
    value: 700,
    sizing: 'px'
  };
  _rebalanceVisible$ = new BehaviorSubject(false);
  colDefs$: Observable<PinnaklColDef[]>;
  getRowNodeId$: Observable<(data: any) => string>;
  gridAggregations$: Observable<any[]>;
  gridData$: Observable<any[]>;
  @Output() selectPosition = new EventEmitter<any>();
  @Output() filtersChange = new EventEmitter<any>();
  @ViewChild(PositionsGridComponent, { static: false })
  positionsGridComponent: PositionsGridComponent;
  private readonly _ACTION_BUTTON_FIELD_NAME = 'ActionButton';

  constructor(
    private readonly _positionsUiStateFacade: PositionsUiStateFacade,
    private readonly _decimalPipe: DecimalPipe,
    private readonly _store: Store,
    private readonly positionHomeService: PositionHomeService
  ) {}

  ngOnInit(): void {
    this.colDefs$ = combineLatest([
      this._positionsUiStateFacade.positionsGridColDefs$,
      this._rebalanceVisible$
    ]).pipe(
      map(([colDefs, isVisible]) => {
        colDefs = this.addHeaderTooltip(colDefs);
        const rebalanceColumns: any[] = isVisible ? [
          {
            field: 'rebalanceAdjPct',
            headerName: 'Target MV%',
            filter: 'agNumberColumnFilter',
            flex: 1,
            cellStyle: { 'text-align': 'right', color: 'blue' },
            resizable: true,
            sortable: true,
            suppressSizeToFit: false,
            suppressToolPanel: true,
            editable: ({ node }) => node.data.AssetType !== 'CASH',
            valueFormatter: params => {
              const value = params.data?.rebalanceAdjPct;
              if (!value && value !== 0) {
                return '';
              }
              return this._decimalPipe.transform(value, '1.2-2');
            },
            onCellValueChanged: params => {
              this._store.dispatch(UpdatePositionsReportData({
                reportDataToUpdate: {
                  AccountId: params.data.AccountId,
                  SecurityId: params.data.SecurityId,
                  CustomAttributeId: params.data.CustomAttributeId,
                  rebalanceAdjPct: parseFloat(params.newValue)
                }
              }));
            }
          },
          {
            field: 'tradeQuantity',
            headerName: 'Trade Quantity',
            filter: 'agNumberColumnFilter',
            flex: 1,
            cellStyle: { 'text-align': 'right', color: 'blue' },
            resizable: true,
            sortable: true,
            suppressSizeToFit: false,
            suppressToolPanel: true,
            editable: true,
            valueFormatter: params => {
              const value = params.data?.tradeQuantity;
              if (!value && value !== 0) {
                return  '';
              }
              return this._decimalPipe.transform(value, '1.0-0');
            },
            onCellValueChanged: params => {
              this._store.dispatch(UpdatePositionsReportData({
                reportDataToUpdate: {
                  AccountId: params.data.AccountId,
                  SecurityId: params.data.SecurityId,
                  CustomAttributeId: params.data.CustomAttributeId,
                  rebalanceAdjPct: null,
                  tradeQuantity: parseFloat(params.newValue)
                }
              }));
            }
          },
          {
            aggFunc: 'sum',
            field: 'tradeCost',
            headerName: 'Trade Cost',
            filter: 'agNumberColumnFilter',
            flex: 1,
            cellStyle: { 'text-align': 'right' },
            resizable: true,
            sortable: true,
            suppressSizeToFit: false,
            suppressToolPanel: true,
            valueFormatter: params => {
              const value = params.data?.tradeCost;
              if (!value && value !== 0) {
                return '';
              }
              if (typeof value === 'string') {
                return value;
              }
              return this._decimalPipe.transform(value, '1.0-0');
            }
          }
        ] : [];

          if (isVisible && this.positionHomeService.pmsRebalanceConfig$.getValue().BPSPctVisible) {
            rebalanceColumns.unshift({
              field: 'rebalanceAdjBPS',
              headerName: 'BPS Adj',
              filter: 'agNumberColumnFilter',
              flex: 1,
              resizable: true,
              sortable: true,
              suppressSizeToFit: false,
              suppressToolPanel: true,
              editable: ({ node }) => node.data.AssetType !== 'CASH',
              cellStyle: { 'text-align': 'right', color: 'blue' },
              onCellValueChanged: params => {
                this._store.dispatch(UpdatePositionsReportData({
                  reportDataToUpdate: {
                    AccountId: params.data.AccountId,
                    SecurityId: params.data.SecurityId,
                    CustomAttributeId: params.data.CustomAttributeId,
                    rebalanceAdjBPS: parseFloat(params.newValue)
                  }
                }));
              }
            });
          }

        return colDefs.concat([
          ...rebalanceColumns,
          {
            field: this._ACTION_BUTTON_FIELD_NAME,
            headerName: 'Action',
            maxWidth: 60,
            minWidth: 40,
            pinned: 'right',
            cellRenderer: ({ context, data }: ICellRendererParams) => {
              if (!data || !data.SecurityId) {
                return null;
              }
              const element = document.createElement('div');
              element.setAttribute(
                'style',
                `cursor: pointer;
                width: 22px;
                height: 22px;
                background-position: center center;
                background-repeat: no-repeat;
                background-color: #f44336;
                background-image: url('assets/images/icons/dots.png');
                border-radius: 50%;`
              );
              element.addEventListener('click', () => {
                context.componentParent.actionBtnClicked(data);
              });
              return element;
            },
            pinnedRowCellRenderer: () => ''
          }
        ]);
        }
      )
    );
    this.gridAggregations$ = this._positionsUiStateFacade.positionsGridAggregations$;
    this.gridData$ = this._positionsUiStateFacade.getPositionsCalculatedData$;
    this.getRowNodeId$ = this._positionsUiStateFacade.getRowNodeId$;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.rebalanceVisible) {
      this._rebalanceVisible$.next(changes.rebalanceVisible.currentValue);
    }
    if (changes.gridHeight && this.positionsGridComponent) {
      this.positionsGridComponent.setGridHeight(this.gridHeight.value + this.gridHeight.sizing);
    }
  }

  columnMoved(viewOrders: { name: string; viewOrder: number }[]): void {
    const selectedColumns = this._getSelectedColumns();
    this._positionsUiStateFacade.updateViewOrders(
      selectedColumns,
      viewOrders
    );
  }

  groupChanged(groupOrders: { name: string; groupOrder: number }[]): void {
    const selectedColumns = this._getSelectedColumns();
    this._positionsUiStateFacade.updateGroupOrders(
      groupOrders,
      selectedColumns
    );
  }

  sortChanged(
    sortOrders: { name: string; sortAscending: boolean; sortOrder: number }[]
  ): void {
    const selectedColumns = this._getSelectedColumns();
    this._positionsUiStateFacade.updateSortOrders(selectedColumns, sortOrders);
  }

  filtersChanged(valuesHashMap: { [key: string]: number[]}): void {
    this._store.dispatch(UpdatePositionsColumnsFilteredValues({ valuesHashMap }));
  }

  private _getSelectedColumns(): ReportingColumn[] {
    let selectedColumns: ReportingColumn[];
    this._positionsUiStateFacade.positionsReportSelectedColumns$
      .pipe(first())
      .subscribe(x => (selectedColumns = x));
    return selectedColumns;
  }

  private addHeaderTooltip(colDefs: PinnaklColDef[]): PinnaklColDef[] {
    return colDefs.map(col => {
      col.headerTooltip = col.headerName;
      return col;
    });
  }
}
