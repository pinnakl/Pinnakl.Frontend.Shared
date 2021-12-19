import { Injectable } from '@angular/core';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { EquityFromApi } from '../../models/security/equity-from-api.model';
import { Equity } from '../../models/security/equity.model';

@Injectable()
export class EquityService {
  private readonly _equitiesEndpoint = 'entities/equities';

  constructor(private readonly wsp: WebServiceProvider) { }

  async getEquityFromSecurityId(securityId: number): Promise<Equity> {
    const fields = [
      'Dividend_Frequency',
      'Dividend_Rate',
      'Id',
      'SecurityId',
      'SharesOutstanding'
    ];

    const equities = await this.wsp.getHttp<EquityFromApi[]>({
      endpoint: this._equitiesEndpoint,
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
    return equities.length === 0 ? null : this.formatEquity(equities[0]);
  }

  async postEquity(entityToSave: Equity): Promise<Equity> {
    const entity = await this.wsp.postHttp<EquityFromApi>({
      endpoint: this._equitiesEndpoint,
      body: this.getEquityForServiceRequest(entityToSave)
    });

    return this.formatEquity(entity);
  }

  async putEquity(entityToSave: Equity): Promise<Equity> {
    const entity = await this.wsp.putHttp<EquityFromApi>({
      endpoint: this._equitiesEndpoint,
      body: this.getEquityForServiceRequest(entityToSave)
    });

    return this.formatEquity(entity);
  }

  private formatEquity(entity: EquityFromApi): Equity {
    const dividendFrequencyId = parseInt(entity.dividend_frequency, 10),
      dividendRate = parseFloat(entity.dividend_rate),
      id = parseInt(entity.id, 10),
      securityId = parseInt(entity.securityid, 10),
      sharesOutstanding = parseFloat(entity.sharesoutstanding);
    return new Equity(
      entity.default_indicator === 'True',
      !isNaN(dividendFrequencyId) ? dividendFrequencyId : null,
      !isNaN(dividendRate) ? dividendRate : null,
      !isNaN(id) ? id : null,
      !isNaN(securityId) ? securityId : null,
      !isNaN(sharesOutstanding) ? sharesOutstanding : null
    );
  }

  private getEquityForServiceRequest(entity: Equity): EquityFromApi {
    const entityForApi = {} as EquityFromApi,
      {
        defaultIndicator,
        dividendFrequencyId,
        dividendRate,
        id,
        securityId,
        sharesOutstanding
      } = entity;
    if (defaultIndicator !== undefined) {
      entityForApi.default_indicator = defaultIndicator ? '1' : '0';
    }
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
    // if (sharesOutstanding !== undefined) {
    //   entityForApi.sharesoutstanding =
    //     sharesOutstanding !== null ? sharesOutstanding.toString() : 'null';
    // }
    return entityForApi;
  }
}
