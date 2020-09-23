import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { GridOptions, ICellRendererParams } from 'ag-grid-community';
import { filter, find, orderBy } from 'lodash';
import * as moment from 'moment';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import {
  CurrencyForOMS,
  PinnaklColDef,
  ClientReportColumn,
  IdcColumnsObject,
  ReportColumn,
  ReportParameter,
  ReportingColumn,
  UserReportColumn,
  UserReportCustomAttribute,
  UserReportIdcColumn,
  CustomAttribute,
  AgPeekTextComponent,
  OMSService,
  ReportingService,
  Utility,
  ReportingHelper
} from '@pnkl-frontend/shared';

@Component({
  selector: 'report-manager',
  templateUrl: 'report-manager.component.html',
  styleUrls: ['./report-manager.component.scss'],
  providers: [DatePipe, DecimalPipe]
})
export class ReportManagerComponent implements OnInit {
  // Data from resolves
  clientReportColumns: ClientReportColumn[];
  clientReportId: number;
  currencies: CurrencyForOMS[];
  customAttributes: CustomAttribute[];
  idcColumns: IdcColumnsObject;
  reportColumns: ReportColumn[];
  reportId: number;
  reportName: string;
  reportParameters: ReportParameter[];
  selectedCurrency: CurrencyForOMS;
  userReportColumns: UserReportColumn[];
  userReportCustomAttributes: UserReportCustomAttribute[];
  userReportId: number;
  userReportIdcColumns: UserReportIdcColumn[];

  aggregation: any[] = [];
  colDefs: PinnaklColDef[] = [];
  configVisible = false;
  exportMenuVisible = false;
  filterColumns: ReportingColumn[];
  filterString = '';
  filterVisible = false;
  gridHeight = '0';
  gridOptions: GridOptions = {};
  gridSearchText = '';
  reportData: any[];
  savedColumns: ReportingColumn[];

  get toolPanelVisible(): boolean {
    if (this.gridOptions && this.gridOptions.api) {
      return this.gridOptions.api.isToolPanelShowing();
    }
    return false;
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private datePipe: DatePipe,
    private decimalPipe: DecimalPipe,
    private omsService: OMSService,
    private reportingHelper: ReportingHelper,
    private reportingService: ReportingService,
    private spinner: PinnaklSpinner,
    private utility: Utility
  ) {}

  applyFilter(): void {
    this.filterString = this.reportingHelper.getFilterString(
      this.filterColumns,
      this.reportParameters
    );

    if (this.filterColumns.length === 0) {
      return;
    }
    this.spinner.spin();
    Promise.all([
      this.omsService.getFxRate(
        this.utility.addBusinessDays(moment().toDate(), -1, []),
        this.selectedCurrency
      ),
      this.reportingService.getReportData(
        this.reportId,
        this.reportParameters,
        this.filterColumns
      )
    ])
      .then(result => {
        let [fxRate, data] = result,
          columnsForCrcyConversion = filter(
            this.filterColumns,
            'convertToBaseCurrency'
          );
        if (columnsForCrcyConversion.length > 0 && fxRate) {
          data.map(row => {
            for (let col of columnsForCrcyConversion) {
              row[col.name] = row[col.name] * fxRate.fxRate;
            }
          });
        }

        this.spinner.stop();
        this.filterVisible = false;
        this.loadGrid(data);
      })
      .catch(this.utility.errorHandler.bind(this));
  }

  hideToolPanel(): void {
    this.gridOptions.api.showToolPanel(false);
  }

  ngOnInit(): void {
    let { resolvedData } = this.activatedRoute.snapshot.data;
    Object.assign(this, resolvedData);
    this.selectedCurrency = find(this.currencies, { currency: 'USD' });
    this.reportParameters = orderBy(this.reportParameters, ['name'], ['desc']);
    this.savedColumns = this.reportingHelper.getSavedColumns(
      this.clientReportColumns,
      this.reportColumns,
      this.userReportId,
      this.userReportCustomAttributes,
      this.userReportIdcColumns,
      this.userReportColumns
    );
    setTimeout(() => this.applyFilter());
  }

  onColumnsSelected(columns: ReportingColumn[]): void {
    this.filterColumns = columns;
  }

  onCurrencySelected(currency: CurrencyForOMS): void {
    this.selectedCurrency = currency;
  }

  setReportName(reportName: string): void {
    this.reportName = reportName;
  }

  togglePanel(filter: boolean): void {
    let panel: string, other: string;
    if (filter) {
      panel = 'filterVisible';
      other = 'configVisible';
    } else {
      panel = 'configVisible';
      other = 'filterVisible';
    }
    this[panel] = !this[panel];
    if (this[panel]) {
      this[other] = false;
    }
  }

  private createColumnDefinitions(columns: ReportingColumn[]): PinnaklColDef[] {
    return !columns
      ? []
      : columns.map(col => {
          let cd: PinnaklColDef = {};
          cd.enableRowGroup = true;
          cd.field = col.reportingColumnType === 'idc' ? col.caption : col.name;
          cd.headerName = col.caption;
          this.gridOptions.rowHeight = 25;
          if (!this.isUndefinedOrNull(col.groupOrder)) {
            cd.rowGroupIndex = col.groupOrder;
            cd.hide = true;
          }
          if (!this.isUndefinedOrNull(col.sortAscending)) {
            cd.sort = col.sortAscending ? 'asc' : 'desc';
            cd.sortedAt = col.sortOrder;
          }
          cd.suppressToolPanel = true;

          if (col.isAggregating) {
            cd.aggFunc = 'sum';
            cd.pinnedRowCellRenderer = params => `<b>${params.value}</b>`;
          }
          if (col.type === 'date') {
            cd.valueFormatter = (cell: ICellRendererParams) => {
              let { value } = cell;
              try {
                return this.datePipe.transform(value, 'MM/dd/y');
              } catch (e) {
                return value;
              }
            };
            cd.filter = 'date';
          } else if (col.type === 'numeric') {
            this.numericFormatter(col, cd);
          } else if (col.type === 'longText') {
            cd.cellStyle = {
              'white-space': 'pre-line',
              'word-wrap': 'break-word'
            };
            cd.width = 400;
            cd.customType = 'LongText';
            cd.cellRendererFramework = AgPeekTextComponent;
            cd.autoHeight = true;
          } else if (col.type === 'custom') {
            try {
              const fn = Function('params', col.renderingFunction);
              cd.cellRenderer = <any>fn;
            } catch (e) {
              console.error(e);
            }
          } else if (col.type === 'currency') {
            this.numericFormatter(col, cd);
          } else if (col.type === 'boolean') {
            cd.cellRenderer = (params: any) => {
              if (!params.value || params.value.toLowerCase() === 'false') {
                return '';
              } else {
                return `<i class="icon-pinnakl-ok color-green"></i>`;
              }
            };
          }
          return cd;
        });
  }

  private getAggregation(): any[] {
    if (!this.filterColumns) {
      return [];
    }
    let reportAggregation = this.filterColumns.reduce((aggregation, column) => {
      aggregation[column.name] = '';
      if (column.isAggregating) {
        let sumCol = this.reportData.reduce(
            (sum: number, row) => sum + row[column.name],
            0
          ),
          digitInfo = this.isUndefinedOrNull(column.decimalPlaces)
            ? null
            : `1.${column.decimalPlaces}-${column.decimalPlaces}`;
        aggregation[column.name] = this.decimalPipe.transform(
          sumCol,
          digitInfo
        );
      }
      return aggregation;
    }, {});
    return [reportAggregation];
  }

  private getGridHeight(): string {
    let rowHeight = this.gridOptions.rowHeight;
    let height =
      (this.gridOptions.api.getModel().getRowCount() + 5) * rowHeight;
    return height > document.documentElement.clientHeight * 0.7
      ? '100%'
      : `${height}px`;
  }

  private isUndefinedOrNull(value: any): boolean {
    return value === undefined || value === null;
  }

  private loadGrid(data: any[]): void {
    this.reportData = data;
    this.aggregation = this.getAggregation();
    this.colDefs = this.createColumnDefinitions(
      this.reportingHelper.getColumnsFromGridAndFilter(
        this.filterColumns,
        this.gridOptions
      )
    );
    setTimeout(() => {
      let { gridOptions } = this;
      gridOptions.api.expandAll();
      this.gridHeight = this.getGridHeight();
      this.reportingHelper.setGroupSorts(gridOptions);
    });
  }

  private numericFormatter(col: ReportingColumn, cd: PinnaklColDef): void {
    const prefix = col.type === 'currency' ? '$' : '';
    cd.valueFormatter = (cell: ICellRendererParams) => {
      let { value } = cell;
      if (!value && value !== 0) {
        return '';
      }
      let digitInfo = this.isUndefinedOrNull(col.decimalPlaces)
        ? null
        : `1.${col.decimalPlaces}-${col.decimalPlaces}`;
      try {
        return prefix + this.decimalPipe.transform(value, digitInfo);
      } catch (e) {
        return prefix + value;
      }
    };
    cd.cellStyle = { 'text-align': 'right' };
    cd.filter = 'number';
  }
}
