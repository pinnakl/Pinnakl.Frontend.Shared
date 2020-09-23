import { Injectable } from '@angular/core';

import { GetWebRequest, PostWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { EquityFromApi } from '../../models/security/equity-from-api.model';
import { Equity } from '../../models/security/equity.model';

@Injectable()
export class EquityService {
  private readonly RESOURCE_URL = 'equities';

  constructor(private wsp: WebServiceProvider) {}

  getEquityFromSecurityId(securityId: number): Promise<Equity> {
    let fields = [
      'Dividend_Frequency',
      'Dividend_Rate',
      'Id',
      'SecurityId',
      'SharesOutstanding'
    ];

    const getWebRequest: GetWebRequest = {
      endPoint: this.RESOURCE_URL,
      options: {
        fields: fields,
        filters: [
          {
            key: 'securityid',
            type: 'EQ',
            value: [securityId.toString()]
          }
        ]
      }
    };

    return this.wsp
      .get(getWebRequest)
      .then((entities: EquityFromApi[]) =>
        entities.length === 0 ? null : this.formatEquity(entities[0])
      );
  }

  postEquity(entityToSave: Equity): Promise<Equity> {
    let requestBody = this.getEquityForServiceRequest(entityToSave);

    let postWebRequest: PostWebRequest = {
      endPoint: this.RESOURCE_URL,
      payload: requestBody
    };

    return this.wsp
      .post(postWebRequest)
      .then((entity: EquityFromApi) => this.formatEquity(entity));
  }

  putEquity(entityToSave: Equity): Promise<Equity> {
    let requestBody = this.getEquityForServiceRequest(entityToSave);
    return this.wsp
      .put({
        endPoint: this.RESOURCE_URL,
        payload: requestBody
      })
      .then((entity: EquityFromApi) => this.formatEquity(entity));
  }

  private formatEquity(entity: EquityFromApi): Equity {
    let dividendFrequencyId = parseInt(entity.dividend_frequency),
      dividendRate = parseFloat(entity.dividend_rate),
      id = parseInt(entity.id),
      securityId = parseInt(entity.securityid),
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
    let entityForApi = {} as EquityFromApi,
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
