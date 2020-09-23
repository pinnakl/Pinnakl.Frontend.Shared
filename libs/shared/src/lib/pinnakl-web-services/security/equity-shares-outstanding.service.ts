import { Injectable } from '@angular/core';

import * as moment from 'moment';

import {
  GetWebRequest,
  PostWebRequest,
  PutWebRequest,
  WebServiceProvider
} from '@pnkl-frontend/core';

import { EquitySharesOutstandingFromApi } from '../../models/security';
import { EquitySharesOutstanding } from '../../models/security';

@Injectable()
export class EquitySharesOutstandingService {
  private readonly RESOURCE_URL = 'equity_shares_outstandings';
  private readonly DATE_FORMAT = 'MM/DD/YYYY';

  constructor(private wsp: WebServiceProvider) {}

  get(equityId: number): Promise<EquitySharesOutstanding[]> {
    let fields = [
      'id',
      'equityid',
      'sharesoutstanding',
      'enddate',
      'startdate'
    ];
    const getWebRequest: GetWebRequest = {
      endPoint: this.RESOURCE_URL,
      options: {
        fields,
        filters: [{ key: 'equityid', type: 'EQ', value: [equityId.toString()] }]
      }
    };
    return this.wsp
      .get(getWebRequest)
      .then(entities =>
        entities.map(entity => this.formatSharesOutstanding(entity))
      );
  }

  async saveMany(x: {
    add: EquitySharesOutstanding[];
    delete: EquitySharesOutstanding[];
    update: EquitySharesOutstanding[];
  }): Promise<void> {
    let addPromises = x.add.map(equityToAdd => this.post(equityToAdd));
    let updatePromises = x.update.map(equityToUpdate =>
      this.put(equityToUpdate)
    );
    let deletePromises = x.delete.map(equityToDelete =>
      this.delete(equityToDelete.id)
    );
    await Promise.all(
      addPromises.concat(updatePromises).concat(deletePromises as any[])
    );
  }

  private delete(id: number): Promise<void> {
    return this.wsp.delete({ endPoint: this.RESOURCE_URL, payload: { id } });
  }

  post(
    entityToSave: EquitySharesOutstanding
  ): Promise<EquitySharesOutstanding> {
    let requestBody = this.getEquitySharesOutstandingForServiceRequest(
      entityToSave
    );

    let postWebRequest: PostWebRequest = {
      endPoint: this.RESOURCE_URL,
      payload: requestBody
    };

    return this.wsp
      .post(postWebRequest)
      .then((entity: EquitySharesOutstandingFromApi) =>
        this.formatSharesOutstanding(entity)
      );
  }

  private put(
    entityToSave: EquitySharesOutstanding
  ): Promise<EquitySharesOutstanding> {
    let requestBody = this.getEquitySharesOutstandingForServiceRequest(
      entityToSave
    );

    let putWebRequest: PutWebRequest = {
      endPoint: this.RESOURCE_URL,
      payload: requestBody
    };

    return this.wsp
      .put(putWebRequest)
      .then((entity: EquitySharesOutstandingFromApi) =>
        this.formatSharesOutstanding(entity)
      );
  }

  private getEquitySharesOutstandingForServiceRequest(
    entity: EquitySharesOutstanding
  ): EquitySharesOutstandingFromApi {
    let entityForApi = {} as EquitySharesOutstandingFromApi,
      { endDate, equityId, id, sharesOutstanding, startDate } = entity;
    if (endDate !== undefined) {
      entityForApi.enddate =
        endDate != null ? moment(endDate).format(this.DATE_FORMAT) : 'null';
    }
    if (equityId !== undefined) {
      entityForApi.equityid = equityId !== null ? equityId.toString() : 'null';
    }
    if (id !== undefined) {
      entityForApi.id = id.toString();
    }

    if (sharesOutstanding !== undefined) {
      entityForApi.sharesoutstanding =
        sharesOutstanding != null ? sharesOutstanding.toString() : 'null';
    }
    if (startDate !== undefined) {
      entityForApi.startdate =
        startDate !== null
          ? moment(startDate).format(this.DATE_FORMAT)
          : 'null';
    }
    return entityForApi;
  }

  private formatSharesOutstanding(
    entity: EquitySharesOutstandingFromApi
  ): EquitySharesOutstanding {
    let sharesOutstanding = parseFloat(entity.sharesoutstanding),
      endDateMoment = moment(entity.enddate, this.DATE_FORMAT),
      startDateMoment = moment(entity.startdate, this.DATE_FORMAT);
    return {
      id: parseInt(entity.id),
      equityId: parseInt(entity.equityid),
      sharesOutstanding: !isNaN(sharesOutstanding) ? sharesOutstanding : null,
      endDate: endDateMoment.isValid() ? endDateMoment.toDate() : null,
      startDate: startDateMoment.isValid() ? startDateMoment.toDate() : null
    };
  }
}
