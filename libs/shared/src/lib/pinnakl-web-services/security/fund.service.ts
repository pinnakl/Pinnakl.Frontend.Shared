import { Injectable } from '@angular/core';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { Fund } from '../../models/security';
import { FundFromApi } from '../../models/security/fund-from-api.model';

@Injectable()
export class FundService {
  private readonly _fundsEndpoint = 'entities/funds';

  constructor(private readonly wsp: WebServiceProvider) { }

  async getFundFromSecurityId(securityId: number): Promise<Fund> {
    const fields = [
      'Dividend_Frequency',
      'Dividend_Rate',
      'Id',
      'SecurityId',
      'SharesOutstanding'
    ];

    const funds = await this.wsp.getHttp<FundFromApi[]>({
      endpoint: this._fundsEndpoint,
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

    return funds.length === 0 ? null : this.formatFund(funds[0]);
  }

  async postFund(entityToSave: Fund): Promise<Fund> {
    const entity = await this.wsp.postHttp<FundFromApi>({
      endpoint: this._fundsEndpoint,
      body: this.getFundForServiceRequest(entityToSave)
    });

    return this.formatFund(entity);
  }

  async putFund(entityToSave: Fund): Promise<Fund> {
    const entity = await this.wsp.putHttp<FundFromApi>({
      endpoint: this._fundsEndpoint,
      body: this.getFundForServiceRequest(entityToSave)
    });

    return this.formatFund(entity);
  }

  private formatFund(entity: FundFromApi): Fund {
    const dividendFrequencyId = parseInt(entity.dividend_frequency, 10),
      dividendRate = parseFloat(entity.dividend_rate),
      id = parseInt(entity.id, 10),
      securityId = parseInt(entity.securityid, 10),
      sharesOutstanding = parseFloat(entity.sharesoutstanding);
    return new Fund(
      !isNaN(dividendFrequencyId) ? dividendFrequencyId : null,
      !isNaN(dividendRate) ? dividendRate : null,
      !isNaN(id) ? id : null,
      !isNaN(securityId) ? securityId : null,
      !isNaN(sharesOutstanding) ? sharesOutstanding : null
    );
  }

  private getFundForServiceRequest(entity: Fund): FundFromApi {
    const entityForApi = {} as FundFromApi,
      {
        dividendFrequencyId,
        dividendRate,
        id,
        securityId,
        sharesOutstanding
      } = entity;
    if (dividendFrequencyId !== undefined) {
      entityForApi.dividend_frequency =
        dividendFrequencyId !== null ? dividendFrequencyId.toString() : 'null';
    }
    if (dividendRate !== undefined) {
      entityForApi.dividend_rate =
        dividendRate !== null ? dividendRate.toString() : 'null';
    }
    if (id !== undefined) {
      entityForApi.id = id.toString();
    }
    if (securityId !== undefined) {
      entityForApi.securityid = securityId.toString();
    }
    if (sharesOutstanding !== undefined) {
      entityForApi.sharesoutstanding =
        sharesOutstanding !== null ? sharesOutstanding.toString() : 'null';
    }
    return entityForApi;
  }
}
