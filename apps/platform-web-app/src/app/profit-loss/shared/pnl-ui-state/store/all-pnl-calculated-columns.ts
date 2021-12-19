import { formatNumber } from '@angular/common';
import { ValueFormatterParams } from 'ag-grid-community';

import { PinnaklColDef } from '@pnkl-frontend/shared';

const currencyFormatter = (cell: ValueFormatterParams) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
}).format(cell.value);

export const allPnlCalculatedColumns: PinnaklColDef[] = [
  {
    headerName: 'Date',
    field: 'date',
    enableRowGroup: true
  },
  {
    headerName: 'Asset Type',
    field: 'assetType',
    enableRowGroup: true,
    valueFormatter: (i: any): string => i.value.toUpperCase()
  },
  {
    headerName: 'Ticker',
    field: 'ticker',
    enableRowGroup: true
  },
  {
    headerName: 'Identifier',
    field: 'identifier',
    enableRowGroup: true
  },
  {
    headerName: 'Description',
    field: 'description',
    enableRowGroup: true
  },
  {
    headerName: 'Analyst',
    field: 'Analyst',
    enableRowGroup: true
  },
  {
    headerName: 'Folder',
    field: 'Folder',
    enableRowGroup: true
  },
  {
    headerName: 'Strategy',
    field: 'Strategy',
    enableRowGroup: true
  },
  {
    headerName: 'Trader',
    field: 'Trader',
    enableRowGroup: true
  },
  {
    cellStyle: { 'text-align': 'right' },
    valueFormatter: ({value}: ValueFormatterParams) => {
      if (!value && value !== 0) {
        return '';
      }
      return formatNumber(value, 'en-US', '1.0-2');
    },
    headerName: 'Closing Position',
    field: 'position',
    enableRowGroup: true
  },
  {
    cellStyle: { 'text-align': 'right' },
    valueFormatter: ({value}: ValueFormatterParams) => {
      if (!value && value !== 0) {
        return '';
      }
      return formatNumber(value, 'en-US', '1.0-2');
    },
    headerName: 'Closing Price Base',
    field: 'price',
    enableRowGroup: true
  },
  {
    cellStyle: { 'text-align': 'right' },
    headerName: 'Realized P&L',
    field: 'realizedPnl',
    filter: 'number',
    valueFormatter: currencyFormatter,
    aggFunc: 'sum',
    pinnedRowCellRenderer: params => `<b>${params.value}</b>`
  },
  {
    cellStyle: { 'text-align': 'right' },
    headerName: 'UnRealized P&L',
    field: 'unrealizedPnl',
    filter: 'number',
    valueFormatter: currencyFormatter,
    aggFunc: 'sum',
    pinnedRowCellRenderer: params => `<b>${params.value}</b>`
  },
  {
    cellStyle: { 'text-align': 'right' },
    headerName: 'Coupon',
    field: 'coupon',
    valueFormatter: currencyFormatter,
    aggFunc: 'sum',
    pinnedRowCellRenderer: params => `<b>${params.value}</b>`
  },
  {
    cellStyle: { 'text-align': 'right' },
    headerName: 'Dividend',
    field: 'dividend',
    valueFormatter: currencyFormatter,
    aggFunc: 'sum',
    pinnedRowCellRenderer: params => `<b>${params.value}</b>`
  },
  {
    cellStyle: { 'text-align': 'right' },
    headerName: 'Total P&L',
    field: 'totalPnl',
    valueFormatter: currencyFormatter,
    aggFunc: 'sum',
    pinnedRowCellRenderer: params => `<b>${params.value}</b>`
  }
];
