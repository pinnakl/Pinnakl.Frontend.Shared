import { Injectable } from '@angular/core';
import * as moment from 'moment';

import { GetWebRequest, PostWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { FutureFromApi } from '../../models/security/future-from-api.model';
import { Future } from '../../models/security/future.model';

@Injectable()
export class FutureService {
  private readonly RESOURCE_URL = 'futures';

  constructor(private wsp: WebServiceProvider) {}

  getFutureFromSecurityId(securityId: number): Promise<Future> {
    const fields = [
      'Contract_Size',
      'Expiration_Date',
      'Id',
      'Last_Tradeable_Date',
      'SecurityId',
      'Tick_Size',
      'Tick_Value',
      'Value_Of_1_Pt',
      'InitialMargin',
      'MaintenanceMargin'
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
      .then((entities: FutureFromApi[]) =>
        entities.length === 0 ? null : this.formatFuture(entities[0])
      );
  }

  postFuture(entityToSave: Future): Promise<Future> {
    const requestBody = this.getFutureForServiceRequest(entityToSave);

    const postWebRequest: PostWebRequest = {
      endPoint: this.RESOURCE_URL,
      payload: requestBody
    };

    return this.wsp
      .post(postWebRequest)
      .then((entity: FutureFromApi) => this.formatFuture(entity));
  }

  putFuture(entityToSave: Future): Promise<Future> {
    let requestBody = this.getFutureForServiceRequest(entityToSave);
    return this.wsp
      .put({
        endPoint: this.RESOURCE_URL,
        payload: requestBody
      })
      .then((entity: FutureFromApi) => this.formatFuture(entity));
  }

  private formatFuture(entity: FutureFromApi): Future {
    const contractSize = parseFloat(entity.contract_size),
      expirationDateMoment = moment(entity.expiration_date, 'MM/DD/YYYY'),
      id = parseInt(entity.id),
      lastTradeableDateMoment = moment(
        entity.last_tradeable_date,
        'MM/DD/YYYY'
      ),
      securityId = parseInt(entity.securityid),
      tickSize = parseFloat(entity.tick_size),
      tickValue = parseFloat(entity.tick_value),
      valueOf1Pt = parseFloat(entity.value_of_1_pt),
      initialMargin = parseFloat(entity.initialmargin),
      maintenanceMargin = parseFloat(entity.maintenancemargin);


    return new Future(
      !isNaN(contractSize) ? contractSize : null,
      expirationDateMoment.isValid() ? expirationDateMoment.toDate() : null,
      !isNaN(id) ? id : null,
      lastTradeableDateMoment.isValid()
        ? lastTradeableDateMoment.toDate()
        : null,
      !isNaN(securityId) ? securityId : null,
      !isNaN(tickSize) ? tickSize : null,
      !isNaN(tickValue) ? tickValue : null,
      !isNaN(valueOf1Pt) ? valueOf1Pt : null,
      !isNaN(initialMargin) ? initialMargin : null,
      !isNaN(maintenanceMargin) ? maintenanceMargin : null,

    );
  }

  private getFutureForServiceRequest(entity: Future): FutureFromApi {
    const entityForApi = {} as FutureFromApi,
      {
        contractSize,
        expirationDate,
        id,
        lastTradeableDate,
        securityId,
        tickSize,
        tickValue,
        valueOf1Pt,
        initialMargin,
        maintenanceMargin
      } = entity;


    if (contractSize !== undefined) {
      entityForApi.contract_size =
        contractSize !== null ? contractSize.toString() : 'null';
    }
    if (expirationDate !== undefined) {
      entityForApi.expiration_date =
        expirationDate !== null
          ? moment(expirationDate).format('MM/DD/YYYY')
          : 'null';
    }
    if (id !== undefined) {
      entityForApi.id = id.toString();
    }
    if (lastTradeableDate !== undefined) {
      entityForApi.last_tradeable_date =
        lastTradeableDate !== null
          ? moment(lastTradeableDate).format('MM/DD/YYYY')
          : 'null';
    }
    if (securityId !== undefined) {
      entityForApi.securityid = securityId.toString();
    }
    if (tickSize !== undefined) {
      entityForApi.tick_size = tickSize !== null ? tickSize.toString() : 'null';
    }
    if (tickValue !== undefined) {
      entityForApi.tick_value =
        tickValue !== null ? tickValue.toString() : 'null';
    }
    if (valueOf1Pt !== undefined) {
      entityForApi.value_of_1_pt =
        valueOf1Pt !== null ? valueOf1Pt.toString() : 'null';
    }
    if (initialMargin !== undefined) {
      entityForApi.initialmargin =
      initialMargin !== null ? initialMargin.toString() : 'null';
    }
    if (maintenanceMargin !== undefined) {
      entityForApi.maintenancemargin =
      maintenanceMargin !== null ? maintenanceMargin.toString() : 'null';
    }

    return entityForApi;
  }
}
