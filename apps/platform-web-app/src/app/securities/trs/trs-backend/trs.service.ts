import { Injectable } from '@angular/core';

import * as moment from 'moment';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { TRSFromApi } from './trs-from-api.model';
import { TRS } from './trs.model';

@Injectable()
export class TRSService {
  private readonly _trsEndpoint = 'entities/trs';
  private readonly DATE_FORMAT = 'MM/DD/YYYY';

  constructor(private readonly wsp: WebServiceProvider) {}

  delete(id: number): Promise<void> {
    return this.wsp.deleteHttp({ endpoint: `${this._trsEndpoint}/${id}` });
  }

  async getTRSFromSecId(securityId: number): Promise<TRS[]> {
    if (!securityId) {
      return Promise.resolve([] as TRS[]);
    }

    const fields = [
      'id',
      'securityid',
      'startdate',
      'effectivedate',
      'terminationdate',
      'baserate',
      'spread',
      'daycount',
      'swaprefno',
      'resetindicator',
      'underlyingSecurityId'
    ];

    const trs = await this.wsp.getHttp<TRSFromApi[]>({
      endpoint: this._trsEndpoint,
      params: {
        fields: fields,
        filters: [
          {
            key: 'securityid',
            type: 'EQ',
            value: [securityId.toString()]
          }
        ]
      }
    });

    return trs.length === 0 ? null : trs.map(this.formatTRSFromApi);
  }

  async post(entity: Partial<TRS>): Promise<TRS> {
    const savedEntity = await this.wsp.postHttp<TRSFromApi>({
      endpoint: this._trsEndpoint,
      body: this.getTRSServiceRequest(entity)
    });

    return this.formatTRSFromApi(savedEntity);
  }

  async put(entity: Partial<TRS>): Promise<TRS> {
    const savedEntity = await this.wsp.putHttp<TRSFromApi>({
      endpoint: this._trsEndpoint,
      body: this.getTRSServiceRequest(entity)
    });

    return this.formatTRSFromApi(savedEntity);
  }

  private formatTRSFromApi(entity: TRSFromApi): TRS {
    return new TRS(
      +entity.id,
      +entity.securityid,
      moment(entity.startdate, this.DATE_FORMAT).toDate(),
      moment(entity.effectivedate, this.DATE_FORMAT).toDate(),
      moment(entity.terminationdate, this.DATE_FORMAT).toDate(),
      +entity.baserate,
      +entity.spread,
      entity.daycount,
      entity.swaprefno,
      entity.resetindicator,
      +entity.underlyingsecurityid
    );
  }

  private getTRSServiceRequest(entity: Partial<TRS>): Partial<TRSFromApi> {
    const entityForApi: Partial<TRSFromApi> = {};

    entityForApi.securityid = entity.securityId.toString();
    entityForApi.startdate = moment(entity.startDate).format(this.DATE_FORMAT);
    entityForApi.effectivedate = moment(entity.effectiveDate).format(
      this.DATE_FORMAT
    );
    entityForApi.terminationdate = moment(entity.terminationDate).format(
      this.DATE_FORMAT
    );
    entityForApi.baserate = entity.baseRate.toString();
    entityForApi.spread = entity.spread.toString();
    entityForApi.daycount = entity.dayCount.toString();
    entityForApi.swaprefno = entity.swapRefNo.toString();
    entityForApi.resetindicator = entity.resetIndicator.toString();
    entityForApi.underlyingsecurityid = entity.underlyingSecurityId.toString();

    return entityForApi;
  }
}
