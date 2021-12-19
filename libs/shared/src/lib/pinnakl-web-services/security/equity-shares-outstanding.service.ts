import { Injectable } from '@angular/core';

import * as moment from 'moment';

import {
  WebServiceProvider
} from '@pnkl-frontend/core';

import { EquitySharesOutstandingFromApi } from '../../models/security';
import { EquitySharesOutstanding } from '../../models/security';

@Injectable()
export class EquitySharesOutstandingService {
  private readonly _equitySharesOutEndpoint =
    'entities/equity_shares_outstandings';
  private readonly DATE_FORMAT = 'MM/DD/YYYY';

  constructor(private readonly wsp: WebServiceProvider) { }

  async get(equityId: number): Promise<EquitySharesOutstanding[]> {
    const fields = [
      'id',
      'equityid',
      'sharesoutstanding',
      'enddate',
      'startdate'
    ];

    const sharesOut = await this.wsp
      .getHttp<EquitySharesOutstandingFromApi[]>({
        endpoint: this._equitySharesOutEndpoint,
        params: {
          fields,
          filters: [
            { key: 'equityid', type: 'EQ', value: [equityId.toString()] }
          ]
        }
      });

    return sharesOut.map(this.formatSharesOutstanding);
  }

  async saveMany(x: {
    add: EquitySharesOutstanding[];
    delete: EquitySharesOutstanding[];
    update: EquitySharesOutstanding[];
  }): Promise<void> {
    const addPromises = x.add.map(equityToAdd => this.post(equityToAdd));
    const updatePromises = x.update.map(equityToUpdate =>
      this.put(equityToUpdate)
    );
    const deletePromises = x.delete.map(equityToDelete =>
      this.delete(equityToDelete.id)
    );
    await Promise.all(
      addPromises.concat(updatePromises).concat(deletePromises as any[])
    );
  }

  private async delete(id: number): Promise<void> {
    return this.wsp.deleteHttp({
      endpoint: `${this._equitySharesOutEndpoint}/${id}`
    });
  }

  async post(
    entityToSave: EquitySharesOutstanding
  ): Promise<EquitySharesOutstanding> {
    const entity = await this.wsp.postHttp<EquitySharesOutstandingFromApi>({
      endpoint: this._equitySharesOutEndpoint,
      body: this.getEquitySharesOutstandingForServiceRequest(entityToSave)
    });

    return this.formatSharesOutstanding(entity);
  }

  private async put(
    entityToSave: EquitySharesOutstanding
  ): Promise<EquitySharesOutstanding> {
    const entity = await this.wsp.putHttp<EquitySharesOutstandingFromApi>({
      endpoint: this._equitySharesOutEndpoint,
      body: this.getEquitySharesOutstandingForServiceRequest(entityToSave)
    });

    return this.formatSharesOutstanding(entity);
  }

  private getEquitySharesOutstandingForServiceRequest(
    entity: EquitySharesOutstanding
  ): EquitySharesOutstandingFromApi {
    const entityForApi = {} as EquitySharesOutstandingFromApi,
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
    const sharesOutstanding = parseFloat(entity.sharesoutstanding),
      endDateMoment = moment(entity.enddate, this.DATE_FORMAT),
      startDateMoment = moment(entity.startdate, this.DATE_FORMAT);
    return {
      id: parseInt(entity.id, 10),
      equityId: parseInt(entity.equityid, 10),
      sharesOutstanding: !isNaN(sharesOutstanding) ? sharesOutstanding : null,
      endDate: endDateMoment.isValid() ? endDateMoment.toDate() : null,
      startDate: startDateMoment.isValid() ? startDateMoment.toDate() : null
    };
  }
}
