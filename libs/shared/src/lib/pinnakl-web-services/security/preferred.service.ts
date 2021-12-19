import { Injectable } from '@angular/core';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { Preferred } from '../../models/security';
import { PreferredFromApi } from '../../models/security/preferred-from-api.model';

@Injectable()
export class PreferredService {
  private readonly _preferredEndpoint = 'entities/preferreds';

  constructor(private readonly wsp: WebServiceProvider) { }

  async getPreferredFromSecurityId(securityId: number): Promise<Preferred> {
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

    const preferreds = await this.wsp.getHttp<PreferredFromApi[]>({
      endpoint: this._preferredEndpoint,
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
    return preferreds.length === 0 ? null : this.formatPreferred(preferreds[0]);
  }

  async postPreferred(entityToSave: Preferred): Promise<Preferred> {
    const entity = await this.wsp.postHttp<PreferredFromApi>({
      endpoint: this._preferredEndpoint,
      body: this.getPreferredForServiceRequest(entityToSave)
    });

    return this.formatPreferred(entity);
  }

  async putPreferred(entityToSave: Preferred): Promise<Preferred> {
    const entity = await this.wsp.putHttp<PreferredFromApi>({
      endpoint: this._preferredEndpoint,
      body: this.getPreferredForServiceRequest(entityToSave)
    });

    return this.formatPreferred(entity);
  }

  private formatPreferred(entity: PreferredFromApi): Preferred {
    const dividendFrequencyId = parseInt(entity.dividend_frequency, 10),
      dividendRate = parseFloat(entity.dividend_rate),
      id = parseInt(entity.id, 10),
      minPiece = parseFloat(entity.min_piece),
      nominalValue = parseFloat(entity.nominal_value),
      outstandingAmount = parseFloat(entity.outstanding_amount),
      securityId = parseInt(entity.securityid, 10);
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
