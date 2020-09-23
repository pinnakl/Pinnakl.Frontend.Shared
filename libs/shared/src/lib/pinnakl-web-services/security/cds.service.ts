import { Injectable } from '@angular/core';

import * as moment from 'moment';

import { GetWebRequest, PostWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { CdsFromApi } from '../../models/security/cds-from-api.model';
import { Cds } from '../../models/security/cds.model';

@Injectable()
export class CdsService {
  private readonly RESOURCE_URL = 'cds';
  constructor(private wsp: WebServiceProvider) {}

  postCds(entityToSave: Cds): Promise<Cds> {
    let requestBody = this.getCdsForServiceRequest(entityToSave);

    let postWebRequest: PostWebRequest = {
      endPoint: this.RESOURCE_URL,
      payload: requestBody
    };

    return this.wsp
      .post(postWebRequest)
      .then((entity: CdsFromApi) => this.formatCds(entity));
  }

  putCds(entityToSave: Cds): Promise<Cds> {
    let requestBody = this.getCdsForServiceRequest(entityToSave);
    return this.wsp
      .put({
        endPoint: this.RESOURCE_URL,
        payload: requestBody
      })
      .then((entity: CdsFromApi) => this.formatCds(entity));
  }

  getCdsFromSecurityId(securityId: number): Promise<Cds> {
    let fields = [
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

    return this.wsp.get(getWebRequest).then((entities: CdsFromApi[]) => {
      return entities.length === 0 ? null : this.formatCds(entities[0]);
    });
  }

  private getCdsForServiceRequest(entity: Cds): CdsFromApi {
    let entityForApi = {} as CdsFromApi;
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
    let firstpaymentdate = moment(entity.firstpaymentdate, 'MM/DD/YYYY'),
      terminationdate = moment(entity.terminationdate, 'MM/DD/YYYY');

    return new Cds(
      entity.businessdayconvention,
      entity.businessdays,
      firstpaymentdate.isValid() ? firstpaymentdate.toDate() : null,
      entity.fixedratedaycount,
      !isNaN(parseInt(entity.id)) ? parseInt(entity.id) : null,
      !isNaN(parseInt(entity.paymentfrequency))
        ? parseInt(entity.paymentfrequency)
        : null,
      !isNaN(parseInt(entity.securityid)) ? parseInt(entity.securityid) : null,
      !isNaN(parseInt(entity.spread)) ? parseInt(entity.spread) : null,
      terminationdate.isValid() ? terminationdate.toDate() : null,
      entity.underlyingidentifier
    );
  }
}
