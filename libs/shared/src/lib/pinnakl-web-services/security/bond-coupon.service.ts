import { Injectable } from '@angular/core';

import * as moment from 'moment';

import {
  WebServiceProvider
} from '@pnkl-frontend/core';

import { BondCouponFromApi } from '../../models/security';
import { BondCoupon } from '../../models/security';

@Injectable()
export class BondCouponService {
  private readonly _bondCouponsEndpoint = 'entities/bond_coupons';
  private readonly DATE_FORMAT = 'MM/DD/YYYY';
  constructor(private readonly wsp: WebServiceProvider) {}

  async getCoupons(bondId: number): Promise<BondCoupon[]> {
    const entities = await this.wsp.getHttp<BondCouponFromApi[]>({
      endpoint: this._bondCouponsEndpoint,
      params: {
        fields: ['id', 'bondid', 'coupon', 'enddate', 'startdate'],
        filters: [{ key: 'bondid', type: 'EQ', value: [bondId.toString()] }]
      }
    });

    return entities.map(this.formatCoupon);
  }

  async post(entityToSave: BondCoupon): Promise<BondCoupon> {
    const entity = await this.wsp.postHttp<BondCouponFromApi>({
      endpoint: this._bondCouponsEndpoint,
      body: this.getBondCouponForServiceRequest(entityToSave)
    });

    return this.formatCoupon(entity);
  }

  async put(entityToSave: BondCoupon): Promise<BondCoupon> {
    const entity = await this.wsp.putHttp<BondCouponFromApi>({
      endpoint: this._bondCouponsEndpoint,
      body: this.getBondCouponForServiceRequest(entityToSave)
    });

    return this.formatCoupon(entity);
  }

  async delete(id: number): Promise<void> {
    return this.wsp.deleteHttp({
      endpoint: `${this._bondCouponsEndpoint}/${id}`
    });
  }

  async saveMany(x: {
    add: BondCoupon[];
    delete: BondCoupon[];
    update: BondCoupon[];
  }): Promise<void> {
    const addPromises = x.add.map(bondToAdd => this.post(bondToAdd));
    const updatePromises = x.update.map(bondToUpdate => this.put(bondToUpdate));
    const deletePromises = x.delete.map(bondToDelete =>
      this.delete(bondToDelete.id)
    );
    await Promise.all(
      addPromises.concat(updatePromises).concat(deletePromises as any[])
    );
  }

  private getBondCouponForServiceRequest(
    entity: BondCoupon
  ): BondCouponFromApi {
    const entityForApi = {} as BondCouponFromApi,
      { endDate, bondId, id, coupon, startDate } = entity;
    if (endDate !== undefined) {
      entityForApi.enddate =
        endDate != null ? moment(endDate).format(this.DATE_FORMAT) : 'null';
    }
    if (bondId !== undefined) {
      entityForApi.bondid = bondId !== null ? bondId.toString() : 'null';
    }
    if (id !== undefined) {
      entityForApi.id = id.toString();
    }

    if (coupon !== undefined) {
      entityForApi.coupon = coupon != null ? coupon.toString() : 'null';
    }
    if (startDate !== undefined) {
      entityForApi.startdate =
        startDate !== null
          ? moment(startDate).format(this.DATE_FORMAT)
          : 'null';
    }
    return entityForApi;
  }

  private formatCoupon(entity: BondCouponFromApi): BondCoupon {
    const coupon = parseFloat(entity.coupon),
      endDateMoment = moment(entity.enddate, this.DATE_FORMAT),
      startDateMoment = moment(entity.startdate, this.DATE_FORMAT);
    return {
      id: parseInt(entity.id, 10),
      bondId: parseInt(entity.bondid, 10),
      coupon: !isNaN(coupon) ? coupon : null,
      endDate: endDateMoment.isValid() ? endDateMoment.toDate() : null,
      startDate: startDateMoment.isValid() ? startDateMoment.toDate() : null
    };
  }
}
