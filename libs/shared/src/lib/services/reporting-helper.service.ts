import { Injectable } from '@angular/core';

import { GridOptions } from 'ag-grid-community';
import * as _ from 'lodash';

import {
  ReportColumn,
  ReportingColumn,
  ReportParameter,
  UserReportColumn,
  UserReportCustomAttribute,
  UserReportIdcColumn
} from '../models';
import { ClientReportColumn } from '../models/reporting/client-report-column.model';
import { CustomAttribute } from '../models/security/custom-attribute.model';
import {
  UserReportColumnService,
  UserReportCustomAttributeService,
  UserReportIdcColumnService
} from '../pinnakl-web-services/reporting';

@Injectable()
export class ReportingHelper {
  constructor(
    private userReportColumnService: UserReportColumnService,
    private userReportCustomAttributeService: UserReportCustomAttributeService,
    private userReportIdcColumnService: UserReportIdcColumnService
  ) {}

  deleteColumn(col: ReportingColumn): Promise<void> {
    switch (col.reportingColumnType) {
      case 'ca': {
        return this.userReportCustomAttributeService.deleteUserReportCustomAttribute(
          col.dbId
        );
      }
      case 'idc': {
        return this.userReportIdcColumnService.deleteUserReportIdcColumn(
          col.dbId
        );
      }
      case 'report': {
        return this.userReportColumnService.deleteUserReportColumn(col.dbId);
      }
      default:
        return Promise.reject(undefined);
    }
  }

  getColumnsFromGridAndFilter(
    filterColumns: ReportingColumn[],
    gridOptions: GridOptions
  ): ReportingColumn[] {
    filterColumns = this.addViewOrderToFilterColumns(filterColumns);
    const gridColumns = this.getGridColumns(gridOptions);
    if (gridColumns.length === 0) {
      return _(filterColumns)
        .filter('include')
        .sortBy('viewOrder')
        .value();
    }
    return _(filterColumns)
      .filter('include')
      .map(fc => {
        const name = fc.reportingColumnType === 'idc' ? fc.caption : fc.name,
          gc = _.find(gridColumns, { name });
        if (gc) {
          gc.decimalPlaces = fc.decimalPlaces;
          gc.isAggregating = fc.isAggregating;
          gc.type = fc.type;
          gc.caption = fc.caption;
          gc.renderingFunction = fc.renderingFunction;
          return gc;
        }
        fc.viewOrder = filterColumns.length;
        return fc;
      })
      .sortBy('viewOrder')
      .value();
  }

  getColumnsFromGridAndFilterToSave(
    filterColumns: ReportingColumn[],
    gridOptions: GridOptions
  ): ReportingColumn[] {
    filterColumns = this.addViewOrderToFilterColumns(filterColumns);
    let gridColumns = this.getGridColumns(gridOptions),
      result: ReportingColumn[];
    if (gridColumns.length === 0) {
      let vo = 1;
      result = _.sortBy(filterColumns, 'viewOrder');
      _(result)
        .filter('include')
        .forEach(col => (col.viewOrder = vo++));
      return result;
    }
    result = _(filterColumns)
      .map(fc => {
        const name = fc.reportingColumnType === 'idc' ? fc.caption : fc.name,
          gc = _.find(gridColumns, { name });
        if (gc) {
          gc.dbId = fc.dbId;
          gc.decimalPlaces = fc.decimalPlaces;
          gc.filters = fc.filters;
          if (!fc.include) {
            gc.viewOrder = -1;
          }
          gc.isAggregating = fc.isAggregating;
          gc.name = fc.name;
          gc.reportingColumnType = fc.reportingColumnType;
          gc.type = fc.type;
          gc.renderingFunction = fc.renderingFunction;
          return gc;
        }
        delete fc.groupOrder;
        delete fc.sortAscending;
        delete fc.sortOrder;
        fc.viewOrder = fc.include ? filterColumns.length : -1;
        return fc;
      })
      .sortBy('viewOrder')
      .value();
    return result;
  }

  getFilterString(
    filterColumns: ReportingColumn[],
    reportParameters: ReportParameter[]
  ): string {
    const parametersString =
        reportParameters && reportParameters.length > 0
          ? reportParameters
              .filter(param =>
                param.type === 'numeric'
                  ? !isNaN(parseFloat(<string>param.value))
                  : param.value
              )
              .reduce((fs, param) => {
                let type = param.type,
                  value = param.value;
                if (type && type.toLowerCase() === 'date') {
                  value = (<Date>value).toLocaleDateString();
                }
                return `${fs} ${param.caption}:${value},`;
              }, '')
              .slice(0, -1)
          : '',
      columnsString =
        filterColumns && filterColumns.length > 0
          ? filterColumns
              .filter(
                col =>
                  col.filters !== undefined &&
                  col.filters !== null &&
                  (col.filters instanceof Array ? col.filters.length > 0 : true)
              )
              .reduce((fs, col) => {
                const filters = col.filters,
                  formattedValue =
                    col.filters instanceof Array
                      ? (<string[]>filters).map(value => value.toUpperCase())
                      : filters;
                return `${fs} ${col.caption}:${formattedValue},`;
              }, '')
              .slice(0, -1)
          : '';
    return parametersString
      ? columnsString
        ? `${parametersString},${columnsString}`
        : parametersString
      : columnsString;
  }

  getReportColumns(
    columns: (ReportColumn | ClientReportColumn | UserReportColumn)[]
  ): ReportingColumn[] {
    return !columns
      ? []
      : (columns as ReportColumn[]).map(rc => {
          const col = new ReportingColumn();
          col.dbId = rc.id;
          col.caption = rc.caption;
          col.convertToBaseCurrency = rc.convertToBaseCurrency;
          col.name = rc.name;
          col.reportingColumnType = 'report';
          col.type = rc.type;

          col.decimalPlaces = rc.decimalPlaces;
          col.filters = rc.filterValues;
          col.groupOrder = rc.groupOrder;
          col.include = rc.viewOrder !== -1;
          col.isAggregating = rc.isAggregating;
          col.renderingFunction = rc.renderingFunction;
          col.sortAscending = rc.sortAscending;
          col.sortOrder = rc.sortOrder;
          col.viewOrder = rc.viewOrder;
          return col;
        });
  }

  public setGroupSorts(gridOptions: GridOptions): void {
    let sortStates = gridOptions.api.getSortModel(),
      rowGroupColumns = gridOptions.columnApi.getRowGroupColumns(),
      allColumns = gridOptions.columnApi.getAllDisplayedColumns(),
      sortStateChanged = false;
    if (rowGroupColumns.length > 0 && sortStates.length > 0) {
      rowGroupColumns
        .filter(col => col.isSorting())
        .forEach(col => {
          const colId = col.getColId(),
            newColId = allColumns
              .find(column => column.getColId().includes(colId))
              .getColId(),
            ss = _.find(sortStates, { colId });
          if (!ss) {
            return;
          }
          ss.colId = newColId;
          sortStateChanged = true;
        });
      if (sortStateChanged) {
        gridOptions.api.setSortModel(sortStates);
      }
    }
  }

  public getSavedColumns(
    clientReportColumns: ClientReportColumn[],
    reportColumns: ReportColumn[],
    userReportId: number,
    userReportCustomAttributes: UserReportCustomAttribute[],
    userReportIdcColumns: UserReportIdcColumn[],
    userReportColumns: UserReportColumn[]
  ): ReportingColumn[] {
    let reportColumnsExist = false,
      savedColumns: ReportingColumn[] = [];
    if (userReportId) {
      const customAttributesExist =
          userReportCustomAttributes && userReportCustomAttributes.length > 0,
        idcColumnsExist =
          userReportIdcColumns && userReportIdcColumns.length > 0;
      reportColumnsExist = userReportColumns && userReportColumns.length > 0;
      if (reportColumnsExist) {
        savedColumns = this.getReportColumns(userReportColumns);
      }
      if (customAttributesExist) {
        savedColumns = savedColumns.concat(
          this.getCustomAttributes(userReportCustomAttributes)
        );
      }
      if (idcColumnsExist) {
        savedColumns = savedColumns.concat(
          this.getIdcColumns(userReportIdcColumns)
        );
      }
      return savedColumns;
    }
    reportColumnsExist = clientReportColumns && clientReportColumns.length > 0;
    savedColumns = reportColumnsExist
      ? this.getReportColumns(clientReportColumns)
      : this.getReportColumns(reportColumns);
    return savedColumns;
  }

  private addViewOrderToFilterColumns(
    filterColumns: ReportingColumn[]
  ): ReportingColumn[] {
    if (!filterColumns) {
      return [];
    }
    return filterColumns.map(col => {
      if (!col.include) {
        col.viewOrder = -1;
      } else if (col.viewOrder === undefined || col.viewOrder === null) {
        col.viewOrder = filterColumns.length;
      }
      return col;
    });
  }

  private getCustomAttributes(
    attributes: (CustomAttribute | UserReportCustomAttribute)[]
  ): ReportingColumn[] {
    return !attributes
      ? []
      : attributes.map((ca: UserReportCustomAttribute) => {
          const col = new ReportingColumn();
          col.caption = ca.name;
          col.dbId = ca.id;
          col.name = ca.name;
          col.reportingColumnType = 'ca';
          col.type =
            ca.type === 'Number'
              ? 'numeric'
              : ca.type === 'List' || ca.type === 'Text'
              ? 'text'
              : ca.type;

          col.filters = ca.filterValues;
          col.groupOrder = ca.groupOrder;
          col.include = ca.viewOrder !== -1;
          col.isAggregating = ca.isAggregating;
          col.sortAscending = ca.sortAscending;
          col.sortOrder = ca.sortOrder;
          col.viewOrder = ca.viewOrder;
          return col;
        });
  }

  private getGridColumns(gridOptions: GridOptions): ReportingColumn[] {
    const colStates: {
      colId: string;
      rowGroupIndex?: number;
    }[] = gridOptions.columnApi.getColumnState();
    if (!colStates || colStates.length === 0) {
      return [];
    }
    const sortStates = gridOptions.api.getSortModel();
    return colStates.map((colState, i) => {
      const rc = new ReportingColumn();
      rc.name = colState.colId.replace('_1', '');
      if (colState.rowGroupIndex !== null) {
        rc.groupOrder = colState.rowGroupIndex + 1;
      }
      const sortOrder = sortStates.findIndex(ss =>
        ss.colId.includes(colState.colId)
      );
      if (sortOrder !== -1) {
        rc.sortOrder = sortOrder + 1;
        rc.sortAscending = sortStates[sortOrder].sort === 'asc';
      } else {
        rc.sortOrder = null;
        rc.sortAscending = null;
      }
      rc.viewOrder = i + 1;
      return rc;
    });
  }

  private getIdcColumns(
    userReportIdcColumns: UserReportIdcColumn[]
  ): ReportingColumn[] {
    return !userReportIdcColumns
      ? []
      : userReportIdcColumns.map(uric => {
          const col = new ReportingColumn();
          col.caption = _(uric.name)
            .split('.')
            .last()
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          col.dbId = uric.id;
          col.name = uric.name;
          col.reportingColumnType = 'idc';
          col.type = 'text';

          col.filters = uric.filterValues;
          col.groupOrder = uric.groupOrder;
          col.include = uric.viewOrder !== -1;
          col.isAggregating = uric.isAggregating;
          col.sortAscending = uric.sortAscending;
          col.sortOrder = uric.sortOrder;
          col.viewOrder = uric.viewOrder;
          return col;
        });
  }
}
