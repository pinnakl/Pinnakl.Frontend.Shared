import { Injectable } from '@angular/core';

import * as moment from 'moment';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { PnlCalculatedTimeseriesFilter } from './pnl-calculated-timeseries-filter.model';
import { PnlCalculatedTimeseriesFromApi } from './pnl-calculated-timeseries-from-api.model';
import { PnlCalculatedTimeseries } from './pnl-calculated-timeseries.model';

@Injectable()
export class PnlCalculatedTimeseriesService {
  private readonly _pnlCalculatedTimeseries = 'entities/pnl_calculated_timeseries';

  constructor(private readonly wsp: WebServiceProvider) {}

  async getMany({
    accountId,
    endDate,
    groupingKey,
    startDate
  }: PnlCalculatedTimeseriesFilter): Promise<PnlCalculatedTimeseries[]> {
    const resultFromApi: PnlCalculatedTimeseriesFromApi[] = await this.wsp.getHttp<PnlCalculatedTimeseriesFromApi[]>({
      endpoint: this._pnlCalculatedTimeseries,
      params: {
        filters: [
          {
            key: 'accountId',
            type: 'EQ',
            value: [accountId.toString()]
          },
          {
            key: 'startDate',
            type: 'EQ',
            value: [moment(startDate).format('MM/DD/YYYY')]
          },
          {
            key: 'endDate',
            type: 'EQ',
            value: [moment(endDate).format('MM/DD/YYYY')]
          },
          {
            key: 'groupingKey',
            type: 'EQ',
            value: [groupingKey.name]
          },
          {
            key: 'groupingKeyType',
            type: 'EQ',
            value: [groupingKey.type === 'security' ? 'security' : 'trade']
          }
        ]
      }
    });
    return this.formatMany(resultFromApi);
  }

  private format({
    date: dateFromApi,
    ...rest
  }: PnlCalculatedTimeseriesFromApi): PnlCalculatedTimeseries {
    const values = Object.keys(rest).reduce((reduced, key) => ({
        ...reduced,
        [key]: +rest[key]
      }), {});
    const date = moment(dateFromApi, 'MM/DD/YYYY').toDate();
    return {
      date,
      ...values
    } as PnlCalculatedTimeseries;
  }

  private formatMany(
    entities: PnlCalculatedTimeseriesFromApi[]
  ): PnlCalculatedTimeseries[] {
    return entities.map(this.format);
  }
}
