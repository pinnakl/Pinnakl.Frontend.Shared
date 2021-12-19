import { ChartTypes } from '@pnkl-frontend/shared';

export interface PnlCalculatedTimeseriesFilter {
  accountId: number;
  endDate: Date;
  groupingKey: { name: string, type: string };
  dataType: DataTypes;
  chartType: ChartTypes;
  startDate: Date;
}

export const enum DataTypes {
  TOTAL = 'total',
  BY_CATEGORY  = 'by_category'
}
