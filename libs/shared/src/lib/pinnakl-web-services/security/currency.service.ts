import { Injectable } from '@angular/core';

import * as moment from 'moment';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { CurrencyFromApi } from '../../models/security/currency-from-api.model';
import { Currency } from '../../models/security/currency.model';

@Injectable()
export class CurrencyService {
  private readonly _currenciesEndpoint = 'entities/currencies';

  constructor(private readonly wsp: WebServiceProvider) { }

  async getCurrencyFromSecurityId(securityId: number): Promise<Currency> {
    const fields = [
      'ForwardPrice',
      'Id',
      'Maturity',
      'SecondaryCurrencyId',
      'SecurityId'
    ];

    const currencies = await this.wsp.getHttp<CurrencyFromApi[]>({
      endpoint: this._currenciesEndpoint,
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

    return currencies.length === 0 ? null : this.formatCurrency(currencies[0]);
  }

  async postCurrency(entityToSave: Currency): Promise<Currency> {
    const entity = await this.wsp.postHttp<CurrencyFromApi>({
      endpoint: this._currenciesEndpoint,
      body: this.getCurrencyForServiceRequest(entityToSave)
    });

    return this.formatCurrency(entity);
  }

  async putCurrency(entityToSave: Currency): Promise<Currency> {
    const entity = await this.wsp.putHttp<CurrencyFromApi>({
      endpoint: this._currenciesEndpoint,
      body: this.getCurrencyForServiceRequest(entityToSave)
    });

    return this.formatCurrency(entity);
  }

  private formatCurrency(entity: CurrencyFromApi): Currency {
    const forwardPrice = parseInt(entity.forwardprice, 10),
      id = parseInt(entity.id, 10),
      maturityMoment = moment(entity.maturity, 'MM/DD/YYYY'),
      secondaryCurrencyId = parseInt(entity.secondarycurrencyid, 10),
      securityId = parseInt(entity.securityid, 10);
    return new Currency(
      !isNaN(forwardPrice) ? forwardPrice : null,
      !isNaN(id) ? id : null,
      maturityMoment.isValid() ? maturityMoment.toDate() : null,
      !isNaN(secondaryCurrencyId) ? secondaryCurrencyId : null,
      !isNaN(securityId) ? securityId : null
    );
  }

  private getCurrencyForServiceRequest(entity: Currency): CurrencyFromApi {
    const entityForApi = {} as CurrencyFromApi,
      { forwardPrice, id, maturity, secondaryCurrencyId, securityId } = entity;
    if (forwardPrice !== undefined) {
      entityForApi.forwardprice =
        forwardPrice !== null ? forwardPrice.toString() : 'null';
    }
    if (id !== undefined) {
      entityForApi.id = id.toString();
    }
    if (maturity !== undefined) {
      entityForApi.maturity = moment(maturity).format('MM/DD/YYYY');
    }
    if (secondaryCurrencyId !== undefined) {
      entityForApi.secondarycurrencyid = secondaryCurrencyId.toString();
    }
    if (securityId !== undefined) {
      entityForApi.securityid = securityId.toString();
    }
    return entityForApi;
  }
}
