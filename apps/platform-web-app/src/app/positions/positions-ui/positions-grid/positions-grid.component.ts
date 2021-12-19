import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { Store } from '@ngrx/store';

import {
  ColumnRowGroupChangedEvent,
  DragStoppedEvent,
  GridApi,
  GridOptions,
  SortChangedEvent
} from 'ag-grid-community';

import { Broker, Destroyable, PinnaklColDef, RebalanceOrderModel, Security } from '@pnkl-frontend/shared';
import { UpdatePositionsReportData } from '../../positions-backend-state/store/positions-report-data/positions-report-data.actions';
import { PositionHomeService } from '../position-home/position-home.service';

import { flatten, groupBy, isEqual, map } from 'lodash';
import { fromEvent } from 'rxjs';
import { filter, skipUntil, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'positions-grid',
  templateUrl: './positions-grid.component.html',
  styleUrls: ['./positions-grid.component.scss']
})
export class PositionsGridComponent extends Destroyable implements OnInit, OnChanges, AfterViewInit {
  private prevHash = {};

  @Input() colDefs: PinnaklColDef[] = [];
  @Input() gridAggregations: any[] = [];
  // @Input() set gridData(value: any[]) {
  //   if (this.gridApi) {
  //     this.gridApi.setRowData(value);
  //   } else {
  //     this._rowDataToSet = value;
  //   }
  // }
  @Input() getRowNodeId: (data: any) => string;
  @Input() gridData: any[] = [];
  @Output() columnMoved = new EventEmitter();
  @Output() groupChanged = new EventEmitter();
  @Input() searchText = '';
  @Output() sortChanged = new EventEmitter();
  @Output() filtersChanged = new EventEmitter();
  // tslint:disable-next-line:no-output-rename
  @Output('selectPosition') _selectPosition = new EventEmitter<any>();
  gridOptions: GridOptions = {};
  gridApi: GridApi;
  @Input() gridHeight = {
    value: 700,
    sizing: 'px'
  };
  autoGroupColumnDef = {
    sortable: true
  };

  mouseDown$;
  mouseUp$;
  resizingLineElement;
  resizingArea;
  brokers: Broker[] = [];
  securities: Security[] = [];
  fontSize = 13;

  constructor(private readonly positionHomeService: PositionHomeService,
    private readonly _store: Store) {
    super();
  }

  ngOnInit(): void {
    this.gridOptions = {
      context: {
        componentParent: this
      },
      suppressAggFuncInHeader: true
    };
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.setGridHeight(this.gridHeight.value + this.gridHeight.sizing);
      this.positionHomeService.pmsGridFontSizeConfig$
        .pipe(takeUntil((this.unsubscribe$)))
        .subscribe((res: { fontSize: number; id?: string }) => {
          this.fontSize = res.fontSize;
        });
    });
  }

  setGridHeight(height: string): void {
    this.resizingLineElement = document.querySelector('.resizing-bottom-line');
    this.resizingArea = document.querySelector('.drag-container');
    this.mouseDown$ = fromEvent(this.resizingLineElement, 'mousedown');
    this.mouseUp$ = fromEvent(this.resizingArea, 'mouseup');
    this.mouseUp$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.registerResizeEvent();
      });
    this.registerResizeEvent();
    document.getElementById('myGrid').style.height = height;
  }

  registerResizeEvent(): void {
    const mousemove$ = fromEvent(this.resizingArea, 'mousemove');
    mousemove$
      .pipe(skipUntil(this.mouseDown$), takeUntil(this.mouseUp$))
      .subscribe((e: any) => {
      this.gridHeight.value = ((e.pageY - 185) < 0 ? 0 : (e.pageY - 185));
      this.setGridHeight(this.gridHeight.value + this.gridHeight.sizing);
    });
    this.watchPMSActions();
  }

  ngOnChanges(ch: SimpleChanges): void {
    if (ch.colDefs) {
      this.gridApi?.setColumnDefs(ch.colDefs.currentValue);
    }
  }

  onGridReady(params: any): void {
    this.gridApi = params.api;
  }

  actionBtnClicked(position: any): void {
    this._selectPosition.emit(position);
  }

  columnMovedHandler({ columnApi }: DragStoppedEvent): void {
    const columnsFromGrid = columnApi
      .getColumnState()
      // We have not to include ActionButton columns or ag-grid auto columns in saving columns
      .filter(({ colId }) => !colId.includes('ag-Grid-AutoColumn') && !colId.includes('ActionButton'));

    let useColumnSimpler = false;
    if (columnsFromGrid[0].colId.slice(-2) === '_1') {
      useColumnSimpler = true;
    }

    if (this.colDefs.length === columnsFromGrid.length) {
      let shouldUpdate = false;
      this.colDefs.forEach((col, index) => {
        if ((useColumnSimpler ? `${col.field}_1` : col.field) !== columnsFromGrid[index].colId) {
          shouldUpdate = true;
        }
      });
      if (shouldUpdate) {
        this.columnMoved.emit(columnsFromGrid.map(({ colId }, i) => ({
          name: colId.replace('_1', ''),
          viewOrder: i + 1
        })));
      }
    } else {
      this.columnMoved.emit(columnsFromGrid.map(({ colId }, i) => ({
        name: colId.replace('_1', ''),
        viewOrder: i + 1
      })));
    }
  }

  groupHandler({ columns: groupColumns }: ColumnRowGroupChangedEvent): void {
    const newGroupOrders = groupColumns.map((c, i) => ({
      name: c.getColId().replace('_1', ''),
      groupOrder: i + 1
    }));
    this.groupChanged.emit(newGroupOrders);
  }

  sortHandler({ api }: SortChangedEvent): void {
    const newSortOrders = api
      .getSortModel()
      .map(({ colId: name, sort }, i) => ({
        name: name.replace('_1', ''),
        sortAscending: sort === 'asc',
        sortOrder: i + 1
      }));
    this.sortChanged.emit(newSortOrders);
  }

  // filterHandler(event: any): void {
  //   Handling filter changes
  // }

  // modelUpdated(a: any): void {
  //   Handling all changes in data
  // }

  componentStateChanged(event: any): void {
    const hashToEmit = {};

    event.api.rowModel.forEachNodeAfterFilter(({ data }) => {
      if (data?.SecurityId && !hashToEmit[data.SecurityId]) {
        hashToEmit[data.SecurityId] = [];
      }
      if (data?.SecurityId && data.AccountId) {
        hashToEmit[data.SecurityId].push(data.AccountId);
      }
    });

    // Avoid emitting if displayed rows weren't changed
    if (!isEqual(this.prevHash, hashToEmit)) {
      this.prevHash = hashToEmit;
      this.filtersChanged.emit(hashToEmit);
    }
  }

  private watchPMSActions(): void {
    this.positionHomeService.positionsSelectedOrdersTrigger$
      .pipe(takeUntil(this.unsubscribe$), filter(res => !!res))
      .subscribe(() => this.aggregateRebalanceDataToOrders());

    this.positionHomeService.positionsResetOrdersTrigger$
      .pipe(takeUntil(this.unsubscribe$), filter(res => !!res))
      .subscribe(() => this.resetRebalanceWorksheet());
  }

  private aggregateRebalanceDataToOrders(): void {
    this.brokers = this.positionHomeService.brokers$.getValue();
    this.securities = this.positionHomeService.securities$.getValue();
    /** get all values from table with TradeQuantity > 0 */
    const gridData = this.gridApi.getModel()['gridOptionsWrapper']?.gridOptions?.rowData as any[];
    const selectedOrders = gridData.filter(row => !!row?.tradeQuantity);
    /** grouping by securityId */
    const groupedBySecurityId = groupBy(selectedOrders, 'SecurityId');
    /** grouping each positive and negative quantities */
    const groupedByQuantities = map(groupedBySecurityId, security => {
      const quantities = groupBy(security, a => a.tradeQuantity >= 0);
      const positiveQuantity = quantities.true ? this.getRebalanceOrder(quantities.true) : null;
      const negativeQuantity = quantities.false ? this.getRebalanceOrder(quantities.false) : null;
      return {
        positiveQuantity,
        negativeQuantity
      };
    });
    /** making valid data format from grouped */
    const allOrders = flatten(groupedByQuantities.map((el, i) => ([el.positiveQuantity, el.negativeQuantity])));
    const result: RebalanceOrderModel[] = allOrders.filter((el: RebalanceOrderModel) => el);
    this.positionHomeService.selectedPositionOrders$.next(result);
  }

  /** set data for each order */
  private getRebalanceOrder(quantities: any): RebalanceOrderModel {
    const orderQuantity = quantities.reduce((sum, value) => sum + value.tradeQuantity, 0);
    const tradeCost = quantities.reduce((sum, value) => sum + value.tradeCost, 0);
    const brokerId = this.setOrderBrokerId(quantities[0].AssetType);
    const securityId = quantities[0].SecurityId;
    const broker = this.brokers.find((el: Broker) => el.id === brokerId);

    const currentDate = new Date();
    return {
      securityId,
      security: this.securities.find(el => el.id === securityId),
      assetType: quantities[0].AssetType,
      ticker: quantities[0].Ticker,
      tranType: this.setOrderTranType(quantities[0].Position, orderQuantity),
      orderQuantity: Math.abs(orderQuantity),
      orderPrice: quantities[0].PriceLast,
      commission: this.setOrderCommission(quantities[0].AssetType),
      brokerId: broker.id,
      brokerName: broker?.brokerName,
      broker: broker,
      accountCodes: quantities.map(el => ({accountId: el.AccountId, quantity: el.tradeQuantity})),
      position: quantities[0].Position,
      isPositiveQuantity: quantities[0].tradeQuantity >= 0,
      orderStatus: 'STAGED',
      tif: 'DAY',
      tradeDate: currentDate.toISOString(),
      type: 'LMT',
      tradeCost,
      selected: true
    } as RebalanceOrderModel;
  }

  private setOrderCommission(assetType: string): number {
    if (assetType === 'EQUITY') {
      return this.positionHomeService.pmsRebalanceConfig$.getValue().EquityCommAssumption;
    }
    if (assetType === 'OPTION') {
      return this.positionHomeService.pmsRebalanceConfig$.getValue().OptionCommAssumption;
    }
  }

  private setOrderBrokerId(assetType: string): number {
    if (assetType === 'EQUITY') {
      return this.positionHomeService.pmsRebalanceConfig$.getValue().EquityBrokerId;
    }
    if (assetType === 'OPTION') {
      return this.positionHomeService.pmsRebalanceConfig$.getValue().OptionBrokerId;
    }
  }

  private setOrderTranType(position: number, quantity: number): string {
    if (position >= 0 && quantity > 0) {
      return 'B';
    }
    if (position >= 0 && quantity < 0) {
      return 'S';
    }
    if (position < 0 && quantity > 0) {
      return 'BC';
    }
    if (position < 0 && quantity < 0) {
      return 'SS';
    }
  }

  private resetRebalanceWorksheet(): void {
    this.gridApi.forEachNode(node => {
      this._store.dispatch(UpdatePositionsReportData({
        reportDataToUpdate: {
          AccountId: node.data.AccountId,
          SecurityId: node.data.SecurityId,
          CustomAttributeId: node.data.CustomAttributeId,
          rebalanceAdjPct: null
        }
      }));
    });
  }
}
