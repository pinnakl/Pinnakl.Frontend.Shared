import { Injectable } from '@angular/core';

import { GetWebRequest, PostWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { FundFromApi } from '../../models/security/fund-from-api.model';
import { Fund } from '../../models/security/fund.model';

@Injectable()
export class FundService {
  private readonly RESOURCE_URL = 'funds';

  constructor(private wsp: WebServiceProvider) {}

  getFundFromSecurityId(securityId: number): Promise<Fund> {
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
      .then((entities: FundFromApi[]) =>
        entities.length === 0 ? null : this.formatFund(entities[0])
      );
  }

  postFund(entityToSave: Fund): Promise<Fund> {
    let requestBody = this.getFundForServiceRequest(entityToSave);

    let postWebRequest: PostWebRequest = {
      endPoint: this.RESOURCE_URL,
      payload: requestBody
    };

    return this.wsp
      .post(postWebRequest)
      .then((entity: FundFromApi) => this.formatFund(entity));
  }

  putFund(entityToSave: Fund): Promise<Fund> {
    let requestBody = this.getFundForServiceRequest(entityToSave);
    return this.wsp
      .put({
        endPoint: this.RESOURCE_URL,
        payload: requestBody
      })
      .then((entity: FundFromApi) => this.formatFund(entity));
  }

  private formatFund(entity: FundFromApi): Fund {
    let dividendFrequencyId = parseInt(entity.dividend_frequency),
      dividendRate = parseFloat(entity.dividend_rate),
      id = parseInt(entity.id),
      securityId = parseInt(entity.securityid),
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
    let entityForApi = {} as FundFromApi,
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
