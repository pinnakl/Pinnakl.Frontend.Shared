import { Injectable } from '@angular/core';

import * as moment from 'moment';

import { GetWebRequest, PostWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { CurrencyFromApi } from '../../models/security/currency-from-api.model';
import { Currency } from '../../models/security/currency.model';

@Injectable()
export class CurrencyService {
  private readonly RESOURCE_URL = 'currencies';

  constructor(private wsp: WebServiceProvider) {}

  getCurrencyFromSecurityId(securityId: number): Promise<Currency> {
    let fields = [
      'ForwardPrice',
      'Id',
      'Maturity',
      'SecondaryCurrencyId',
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
      .then((entities: CurrencyFromApi[]) =>
        entities.length === 0 ? null : this.formatCurrency(entities[0])
      );
  }

  postCurrency(entityToSave: Currency): Promise<Currency> {
    let requestBody = this.getCurrencyForServiceRequest(entityToSave);

    let postWebRequest: PostWebRequest = {
      endPoint: this.RESOURCE_URL,
      payload: requestBody
    };

    return this.wsp
      .post(postWebRequest)
      .then((entity: CurrencyFromApi) => this.formatCurrency(entity));
  }

  putCurrency(entityToSave: Currency): Promise<Currency> {
    let requestBody = this.getCurrencyForServiceRequest(entityToSave);
    return this.wsp
      .put({
        endPoint: this.RESOURCE_URL,
        payload: requestBody
      })
      .then((entity: CurrencyFromApi) => this.formatCurrency(entity));
  }

  private formatCurrency(entity: CurrencyFromApi): Currency {
    let forwardPrice = parseInt(entity.forwardprice),
      id = parseInt(entity.id),
      maturityMoment = moment(entity.maturity, 'MM/DD/YYYY'),
      secondaryCurrencyId = parseInt(entity.secondarycurrencyid),
      securityId = parseInt(entity.securityid);
    return new Currency(
      !isNaN(forwardPrice) ? forwardPrice : null,
      !isNaN(id) ? id : null,
      maturityMoment.isValid() ? maturityMoment.toDate() : null,
      !isNaN(secondaryCurrencyId) ? secondaryCurrencyId : null,
      !isNaN(securityId) ? securityId : null
    );
  }

  private getCurrencyForServiceRequest(entity: Currency): CurrencyFromApi {
    let entityForApi = {} as CurrencyFromApi,
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
