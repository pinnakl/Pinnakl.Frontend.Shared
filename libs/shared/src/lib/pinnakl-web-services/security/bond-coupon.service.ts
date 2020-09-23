import { Injectable } from '@angular/core';

import * as moment from 'moment';

import {
  GetWebRequest,
  PostWebRequest,
  PutWebRequest,
  WebServiceProvider
} from '@pnkl-frontend/core';

import { BondCouponFromApi } from '../../models/security';
import { BondCoupon } from '../../models/security';

@Injectable()
export class BondCouponService {
  private readonly RESOURCE_URL = 'bond_coupons';
  private readonly DATE_FORMAT = 'MM/DD/YYYY';
  constructor(private wsp: WebServiceProvider) {}

  getCoupons(bondId: number): Promise<BondCoupon[]> {
    let fields = ['id', 'bondid', 'coupon', 'enddate', 'startdate'];
    const getWebRequest: GetWebRequest = {
      endPoint: this.RESOURCE_URL,
      options: {
        fields,
        filters: [{ key: 'bondid', type: 'EQ', value: [bondId.toString()] }]
      }
    };
    return this.wsp
      .get(getWebRequest)
      .then(entities => entities.map(entity => this.formatCoupon(entity)));
  }

  post(entityToSave: BondCoupon): Promise<BondCoupon> {
    let requestBody = this.getBondCouponForServiceRequest(entityToSave);

    let postWebRequest: PostWebRequest = {
      endPoint: this.RESOURCE_URL,
      payload: requestBody
    };

    return this.wsp
      .post(postWebRequest)
      .then((entity: BondCouponFromApi) => this.formatCoupon(entity));
  }

  put(entityToSave: BondCoupon): Promise<BondCoupon> {
    let requestBody = this.getBondCouponForServiceRequest(entityToSave);

    let putWebRequest: PutWebRequest = {
      endPoint: this.RESOURCE_URL,
      payload: requestBody
    };

    return this.wsp
      .put(putWebRequest)
      .then((entity: BondCouponFromApi) => this.formatCoupon(entity));
  }

  delete(id: number): Promise<void> {
    return this.wsp.delete({ endPoint: this.RESOURCE_URL, payload: { id } });
  }

  async saveMany(x: {
    add: BondCoupon[];
    delete: BondCoupon[];
    update: BondCoupon[];
  }): Promise<void> {
    let addPromises = x.add.map(bondToAdd => this.post(bondToAdd));
    let updatePromises = x.update.map(bondToUpdate => this.put(bondToUpdate));
    let deletePromises = x.delete.map(bondToDelete =>
      this.delete(bondToDelete.id)
    );
    await Promise.all(
      addPromises.concat(updatePromises).concat(deletePromises as any[])
    );
  }

  private getBondCouponForServiceRequest(
    entity: BondCoupon
  ): BondCouponFromApi {
    let entityForApi = {} as BondCouponFromApi,
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
    let coupon = parseFloat(entity.coupon),
      endDateMoment = moment(entity.enddate, this.DATE_FORMAT),
      startDateMoment = moment(entity.startdate, this.DATE_FORMAT);
    return {
      id: parseInt(entity.id),
      bondId: parseInt(entity.bondid),
      coupon: !isNaN(coupon) ? coupon : null,
      endDate: endDateMoment.isValid() ? endDateMoment.toDate() : null,
      startDate: startDateMoment.isValid() ? startDateMoment.toDate() : null
    };
  }
}
