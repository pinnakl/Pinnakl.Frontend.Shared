import { Injectable } from '@angular/core';

import { GetWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { PreferredFromApi } from '../../models/security/preferred-from-api.model';
import { Preferred } from '../../models/security/preferred.model';

@Injectable()
export class PreferredService {
  private readonly RESOURCE_URL = 'preferreds';

  constructor(private wsp: WebServiceProvider) {}

  getPreferredFromSecurityId(securityId: number): Promise<Preferred> {
    const fields = [
      'accruing_indicator',
      'convertible_indicator',
      'default_indicator',
      'dividend_frequency',
      'dividend_rate',
      'Id',
      'min_piece',
      'nominal_value',
      'outstanding_amount',
      'SecurityId'
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
      .then((entities: PreferredFromApi[]) =>
        entities.length === 0 ? null : this.formatPreferred(entities[0])
      );
  }

  postPreferred(entityToSave: Preferred): Promise<Preferred> {
    const requestBody = this.getPreferredForServiceRequest(entityToSave);
    return this.wsp
      .post({
        endPoint: this.RESOURCE_URL,
        payload: requestBody
      })
      .then((entity: PreferredFromApi) => this.formatPreferred(entity));
  }

  putPreferred(entityToSave: Preferred): Promise<Preferred> {
    const requestBody = this.getPreferredForServiceRequest(entityToSave);
    return this.wsp
      .put({
        endPoint: this.RESOURCE_URL,
        payload: requestBody
      })
      .then((entity: PreferredFromApi) => this.formatPreferred(entity));
  }

  private formatPreferred(entity: PreferredFromApi): Preferred {
    const dividendFrequencyId = parseInt(entity.dividend_frequency),
      dividendRate = parseFloat(entity.dividend_rate),
      id = parseInt(entity.id),
      minPiece = parseFloat(entity.min_piece),
      nominalValue = parseFloat(entity.nominal_value),
      outstandingAmount = parseFloat(entity.outstanding_amount),
      securityId = parseInt(entity.securityid);
    return new Preferred(
      entity.accruing_indicator === 'True',
      entity.convertible_indicator === 'True',
      entity.default_indicator === 'True',
      !isNaN(dividendFrequencyId) ? dividendFrequencyId : null,
      !isNaN(dividendRate) ? dividendRate : null,
      !isNaN(id) ? id : null,
      !isNaN(minPiece) ? minPiece : null,
      !isNaN(nominalValue) ? nominalValue : null,
      !isNaN(outstandingAmount) ? outstandingAmount : null,
      !isNaN(securityId) ? securityId : null
    );
  }

  private getPreferredForServiceRequest(entity: Preferred): PreferredFromApi {
    const entityForApi = {} as PreferredFromApi,
      {
        accruingIndicator,
        convertibleIndicator,
        defaultIndicator,
        dividendFrequencyId,
        dividendRate,
        id,
        minPiece,
        nominalValue,
        outstandingAmount,
        securityId
      } = entity;
    if (accruingIndicator !== undefined) {
      entityForApi.accruing_indicator = accruingIndicator ? '1' : '0';
    }
    if (convertibleIndicator !== undefined) {
      entityForApi.convertible_indicator = convertibleIndicator ? '1' : '0';
    }
    if (defaultIndicator !== undefined) {
      entityForApi.default_indicator = defaultIndicator ? '1' : '0';
    }
    if (dividendFrequencyId !== undefined) {
      entityForApi.dividend_frequency = dividendFrequencyId.toString();
    }
    if (dividendRate !== undefined) {
      entityForApi.dividend_rate = dividendRate.toString();
    }
    if (id !== undefined) {
      entityForApi.id = id.toString();
    }
    if (minPiece !== undefined) {
      entityForApi.min_piece = minPiece.toString();
    }
    if (nominalValue !== undefined) {
      entityForApi.nominal_value = nominalValue.toString();
    }
    if (outstandingAmount !== undefined) {
      entityForApi.outstanding_amount =
        outstandingAmount !== null ? outstandingAmount.toString() : 'null';
    }
    if (securityId !== undefined) {
      entityForApi.securityid = securityId.toString();
    }
    return entityForApi;
  }
}
