import { Injectable } from '@angular/core';

import * as moment from 'moment';

import {
  DeleteWebRequest,
  GetWebRequest,
  PostWebRequest,
  PutWebRequest,
  WebServiceProvider
} from '@pnkl-frontend/core';
import {
  Position,
  Price,
  PricingComment,
  PricingSource
} from '../models/pricing.model';

@Injectable()
export class PricingService {
  constructor(private wsp: WebServiceProvider) {}

  getPortfolio(
    pricingDate: Date,
    prevPricingDate: Date,
    assetType
  ): Promise<Array<Position>> {
    let pricingDateString = moment(pricingDate).format('MM/DD/YYYY');
    let prevPricingDateString = moment(prevPricingDate).format('MM/DD/YYYY');

    const getWebRequest: GetWebRequest = {
      endPoint: 'portfolio_with_prices',
      options: {
        filters: [
          {
            key: 'pricingdate',
            type: 'EQ',
            value: [pricingDateString]
          },
          {
            key: 'assettype',
            type: 'IN',
            value: assetType
          },
          {
            key: 'prevpricingdate',
            type: 'EQ',
            value: [prevPricingDateString]
          }
        ]
      }
    };

    return this.wsp
      .get(getWebRequest)
      .then(portfolio => portfolio.map(x => this.formatPosition(x)));
  }

  private formatPosition(result: any): Position {
    let change = parseFloat(result.change),
      mid = parseFloat(result.mid),
      prevMid = parseFloat(result.prevmid);
    return new Position(
      result.assettype,
      !isNaN(change) ? change : 0,
      result.comment,
      result.commentid,
      result.description,
      result.identifier,
      !isNaN(mid) ? mid : 0,
      !isNaN(prevMid) ? prevMid : 0,
      result.pricetype,
      result.securityid,
      result.ticker
    );
  }

  getLatestPricingDate(pricingDate: Date): Promise<string> {
    let pricingDateString = moment(pricingDate).format('MM/DD/YYYY');
    let fields = ['pricingdate'];
    const getWebRequest: GetWebRequest = {
      endPoint: 'pricing_dates',
      options: {
        fields: fields,
        filters: [
          {
            key: 'pricingdate',
            type: 'LE',
            value: [pricingDateString]
          },
          {
            key: '',
            type: 'TOP',
            value: ['1']
          }
        ],
        orderBy: [
          {
            field: 'pricingdate',
            direction: 'DESC'
          }
        ]
      }
    };

    return this.wsp.get(getWebRequest).then(result => {
      return result[0].pricingdate;
    });
  }

  getPrices(pricingDate: Date, securityId): Promise<Array<Price>> {
    let pricingDateString = moment(pricingDate).format('MM/DD/YYYY');

    let fields = [
      'id',
      'pricedate',
      'securityid',
      'bid',
      'mid',
      'ask',
      'source',
      'sourcename',
      'evaltime',
      'entrymethod',
      'include'
    ];
    const getWebRequest: GetWebRequest = {
      endPoint: 'prices',
      options: {
        fields: fields,
        filters: [
          {
            key: 'pricedate',
            type: 'EQ',
            value: [pricingDateString]
          },
          {
            key: 'securityid',
            type: 'EQ',
            value: [securityId]
          }
        ]
      }
    };

    return this.wsp
      .get(getWebRequest)
      .then(prices => prices.map(x => this.formatPrice(x)));
  }

  private formatPrice(result: any): Price {
    let mid = parseFloat(result.mid),
      priceDate = moment(result.pricedate, 'MM/DD/YYYY');
    return new Price(
      result.ask,
      result.bid,
      result.entrymethod,
      result.evaltime,
      result.id,
      result.include === 'True' ? true : false,
      !isNaN(mid) ? mid : 0,
      priceDate.isValid() ? priceDate.toDate() : null,
      result.securityid,
      result.source,
      result.sourcename
    );
  }

  getPricingSources(): Promise<PricingSource[]> {
    let fields = ['id', 'name', 'manuallyinsertable', 'fileload', 'exclusive'];
    const getWebRequest: GetWebRequest = {
      endPoint: 'pricing_sources',
      options: {
        fields: fields
      }
    };

    return this.wsp
      .get(getWebRequest)
      .then(pricingSources =>
        pricingSources.map(x => this.formatPricingSource(x))
      );
  }

  private formatPricingSource(result: any): PricingSource {
    return new PricingSource(
      result.exclusive === 'True' ? true : false,
      result.fileload,
      result.id,
      result.manuallyinsertable === 'True' ? true : false,
      result.name
    );
  }

  getPricingSourceBySourceTypeAndName(
    sourceType: string,
    name: string
  ): Promise<any> {
    let fields = ['id'];
    const getWebRequest: GetWebRequest = {
      endPoint: 'pricing_sources',
      options: {
        fields: fields,
        filters: [
          {
            key: 'SourceType',
            type: 'EQ',
            value: [sourceType]
          },
          {
            key: 'Name',
            type: 'EQ',
            value: [name]
          }
        ]
      }
    };

    return this.wsp.get(getWebRequest).then(pricingSources => {
      return new Promise((resolve, reject) => {
        if (pricingSources.length === 1) {
          resolve(pricingSources[0]);
        } else {
          resolve(null);
        }
      });
    });
  }

  savePrices(
    priceDate: Date,
    securityId,
    mid,
    source,
    evaltime,
    include
  ): Promise<Price> {
    let priceDateString = moment(priceDate).format('MM/DD/YYYY');

    const savePriceBody: PostWebRequest = {
      endPoint: 'prices',
      payload: {
        pricedate: priceDateString,
        securityid: securityId,
        mid: mid,
        source: source,
        evaltime: evaltime,
        entrymethod: 'manual',
        include: include === true ? 1 : 0
      }
    };

    return this.wsp.post(savePriceBody).then(price => {
      return this.formatPrice(price);
    });
  }

  deletePrices(id): Promise<string> {
    const deleteWebRequest: DeleteWebRequest = {
      endPoint: 'prices',
      payload: {
        id: id
      }
    };

    return this.wsp.delete(deleteWebRequest);
  }

  savePricingSources(name): Promise<PricingSource> {
    let savePricingSourcesRequestBody = {
      sourcetype: 'pricing',
      name: name,
      manuallyinsertable: 1,
      fileload: 0,
      exclusive: 0
    };

    const savePricesSourcesRequestBody: PostWebRequest = {
      endPoint: 'pricing_sources',
      payload: savePricingSourcesRequestBody
    };

    return this.wsp
      .post(savePricesSourcesRequestBody)
      .then(pricingSource => this.formatPricingSource(pricingSource));
  }

  updatePrices(id, include): Promise<Price> {
    const putWebRequest: PutWebRequest = {
      endPoint: 'prices',
      payload: {
        id: id,
        include: include === true ? 1 : 0
      }
    };

    return this.wsp.put(putWebRequest).then(price => this.formatPrice(price));
  }

  saveComments(priceDate: Date, securityId, comment): Promise<PricingComment> {
    let priceDateString = moment(priceDate).format('MM/DD/YYYY');

    const postWebRequest: PostWebRequest = {
      endPoint: 'price_comments',
      payload: {
        pricedate: priceDateString,
        securityid: securityId,
        comment: comment
      }
    };

    return this.wsp
      .post(postWebRequest)
      .then(result => this.formatPricingComment(result));
  }

  private formatPricingComment(result: any): PricingComment {
    let priceDate = moment(result.pricedate, 'MM/DD/YYYY');

    return new PricingComment(
      result.id,
      priceDate.isValid() ? priceDate.toDate() : null,
      result.securityid,
      result.comment
    );
  }

  updateComments(
    priceDate: Date,
    securityId,
    comment,
    id
  ): Promise<PricingComment> {
    let priceDateString = moment(priceDate).format('MM/DD/YYYY');
    const putWebRequest: PutWebRequest = {
      endPoint: 'price_comments',
      payload: {
        pricedate: priceDateString,
        securityid: securityId,
        comment: comment,
        id: id
      }
    };

    return this.wsp
      .put(putWebRequest)
      .then(result => this.formatPricingComment(result));
  }

  postCarryOverPrices(
    prevPricingDate: Date,
    pricingDate: Date,
    assettype
  ): Promise<any> {
    let prevPricingDateString = moment(prevPricingDate).format('MM/DD/YYYY');
    let pricingDateString = moment(pricingDate).format('MM/DD/YYYY');

    const postWebRequest: PostWebRequest = {
      endPoint: 'prices_carry_over',
      payload: {
        prevpricingdate: prevPricingDateString,
        pricingdate: pricingDateString,
        securitylist: 'manual',
        assettype: assettype
      }
    };
    return this.wsp.post(postWebRequest);
  }
}
