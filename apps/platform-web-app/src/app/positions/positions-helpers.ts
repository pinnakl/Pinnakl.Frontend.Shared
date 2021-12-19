import { CustomAttribute, ReportColumn, ReportingColumn } from '@pnkl-frontend/shared';
import { sortBy } from 'lodash';
import { MarketValueSummary } from './positions-ui/positions-home-market-value-summary/MarketValueSummary.interface';

export function _getReportingColumnFromReportColumn({
  filterValues: filters,
  id: dbId,
  reportId,
  ...rc
}: ReportColumn): ReportingColumn {
  return {
    ...rc,
    dbId,
    filters,
    include: rc.viewOrder !== -1,
    reportingColumnType: 'report'
  };
}

export function _getReportingColumnFromSecurityCustomAttribute({
  id: dbId,
  listOptions,
  ...ca
}: CustomAttribute): ReportingColumn {
  return {
    ...ca,
    caption: ca.name,
    convertToBaseCurrency: false,
    dbId,
    decimalPlaces: null,
    filters: null,
    groupOrder: null,
    include: true,
    isAggregating: false,
    renderingFunction: null,
    reportingColumnType: 'ca',
    sortAscending: null,
    sortOrder: null,
    viewOrder: null,
    formula: null
  };
}

export function _sortByCaption<T>(collection: T[]): T[] {
  return sortBy(collection, ['caption']);
}

export function _sortByName<T>(collection: T[]): T[] {
  return sortBy(collection, ['name']);
}

export function initialMarketValueSummaryObject(
  cashYesterday: number,
  cashToday: number
): MarketValueSummary {
  return {
    lmvY: 0,
    lmvT: 0,
    smvY: 0,
    smvT: 0,
    pnlY: 0,
    pnlT: 0,
    cashY: cashYesterday,
    cashT: cashToday
  };
}

export const isMarketOpen = (): boolean => {
  const todayDateTime = new Date();
  const today = `${todayDateTime.getMonth() + 1}/${todayDateTime.getDate()}/${todayDateTime.getFullYear()}`;
  const startTime = new Date(`${today} 2:31:00 PM Z`);
  const endTime = new Date(`${today} 9:01:00 PM Z`);
  const currDateTime = new Date();

  return currDateTime > startTime && currDateTime < endTime && ![0, 6].includes(currDateTime.getDay());
};
