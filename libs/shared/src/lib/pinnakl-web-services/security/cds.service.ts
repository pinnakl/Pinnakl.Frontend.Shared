import { Injectable } from '@angular/core';

import * as moment from 'moment';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { CdsFromApi } from '../../models/security/cds-from-api.model';
import { Cds } from '../../models/security/cds.model';

@Injectable()
export class CdsService {
  private readonly _creditdefaultswapsEndpoint = 'entities/cds';
  constructor(private readonly wsp: WebServiceProvider) {}

  async postCds(entityToSave: Cds): Promise<Cds> {
    const entity = await this.wsp.postHttp<CdsFromApi>({
      endpoint: this._creditdefaultswapsEndpoint,
      body: this.getCdsForServiceRequest(entityToSave)
    });

    return this.formatCds(entity);
  }

  async putCds(entityToSave: Cds): Promise<Cds> {
    const entity = await this.wsp.putHttp<CdsFromApi>({
      endpoint: this._creditdefaultswapsEndpoint,
      body: this.getCdsForServiceRequest(entityToSave)
    });

    return this.formatCds(entity);
  }

  async getCdsFromSecurityId(securityId: number): Promise<Cds> {
    const fields = [
      'Id',
      'SecurityId',
      'Spread',
      'TerminationDate',
      'PaymentFrequency',
      'BusinessDays',
      'BusinessDayConvention',
      'FixedRateDayCount',
      'FirstPaymentDate',
      'underlyingidentifier'
    ];
    const creditdefaultswaps = await this.wsp.getHttp<CdsFromApi[]>({
      endpoint: this._creditdefaultswapsEndpoint,
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

    return creditdefaultswaps.length === 0
      ? null
      : this.formatCds(creditdefaultswaps[0]);
  }

  private getCdsForServiceRequest(entity: Cds): CdsFromApi {
    const entityForApi = {} as CdsFromApi;
    if (entity.businessDayConvention !== undefined) {
      entityForApi.businessdayconvention =
        entity.businessDayConvention !== null
          ? entity.businessDayConvention.toString()
          : 'null';
    }

    if (entity.underlyingCusip !== undefined) {
      entityForApi.underlyingidentifier =
        entity.underlyingCusip !== null
          ? entity.underlyingCusip.toString()
          : 'null';
    }

    if (entity.businessDays !== undefined) {
      entityForApi.businessdays =
        entity.businessDays !== null ? entity.businessDays.toString() : 'null';
    }

    if (entity.firstPaymentDate !== undefined) {
      entityForApi.firstpaymentdate =
        entity.firstPaymentDate !== null
          ? moment(entity.firstPaymentDate).format('MM/DD/YYYY')
          : 'null';
    }

    if (entity.fixedRateDayCount !== undefined) {
      entityForApi.fixedratedaycount =
        entity.fixedRateDayCount !== null
          ? entity.fixedRateDayCount.toString()
          : 'null';
    }

    if (entity.id !== undefined) {
      entityForApi.id = entity.id.toString();
    }

    if (entity.paymentFrequency !== undefined) {
      entityForApi.paymentfrequency =
        entity.paymentFrequency !== null
          ? entity.paymentFrequency.toString()
          : 'null';
    }

    if (entity.securityId !== undefined && entity.securityId !== null) {
      entityForApi.securityid = entity.securityId.toString();
    }

    if (entity.spread !== undefined) {
      entityForApi.spread =
        entity.spread !== null ? entity.spread.toString() : 'null';
    }

    if (entity.terminationDate !== undefined) {
      entityForApi.terminationdate =
        entity.terminationDate !== null
          ? moment(entity.terminationDate).format('MM/DD/YYYY')
          : 'null';
    }

    return entityForApi;
  }

  private formatCds(entity: CdsFromApi): Cds {
    const firstpaymentdate = moment(entity.firstpaymentdate, 'MM/DD/YYYY'),
      terminationdate = moment(entity.terminationdate, 'MM/DD/YYYY');

    return new Cds(
      entity.businessdayconvention,
      entity.businessdays,
      firstpaymentdate.isValid() ? firstpaymentdate.toDate() : null,
      entity.fixedratedaycount,
      !isNaN(parseInt(entity.id, 10)) ? parseInt(entity.id, 10) : null,
      !isNaN(parseInt(entity.paymentfrequency, 10)) ? parseInt(entity.paymentfrequency, 10) : null,
      !isNaN(parseInt(entity.securityid, 10)) ? parseInt(entity.securityid, 10) : null,
      !isNaN(parseInt(entity.spread, 10)) ? parseInt(entity.spread, 10) : null,
      terminationdate.isValid() ? terminationdate.toDate() : null,
      entity.underlyingidentifier
    );
  }
}
