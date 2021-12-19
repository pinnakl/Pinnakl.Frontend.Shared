import { Injectable } from '@angular/core';

import * as moment from 'moment';

import {
  WebServiceProvider
} from '@pnkl-frontend/core';
import {
  Position,
  Price,
  PricingComment,
  PricingSource
} from '../models';

@Injectable()
export class PricingService {
  private readonly _pricesEndpoint = 'entities/prices';
  private readonly _pricingDatesEndpoint = 'entities/pricing_dates';
  private readonly _priceCommentsEndpoint = 'entities/price_comments';
  private readonly _pricingSourcesEndpoint = 'entities/pricing_sources';
  private readonly _pricesCarryOverEndpoint = 'entities/prices_carry_over';
  private readonly _portfolioWithPricesEndpoint = 'entities/portfolio_with_prices';

  constructor(private readonly wsp: WebServiceProvider) {}

  async getPortfolio(
    pricingDate: Date,
    prevPricingDate: Date,
    assetType: any
  ): Promise<Array<Position>> {
    const portfolio = await this.wsp
      .getHttp<any[]>({
        endpoint: this._portfolioWithPricesEndpoint,
        params: {
          filters: [
            {
              key: 'pricingdate',
              type: 'EQ',
              value: [moment(pricingDate).format('MM/DD/YYYY')]
            },
            {
              key: 'assettype',
              type: 'IN',
              value: assetType
            },
            {
              key: 'prevpricingdate',
              type: 'EQ',
              value: [moment(prevPricingDate).format('MM/DD/YYYY')]
            }
          ]
        }
      });

    return portfolio.map(this.formatPosition);
  }

  async getLatestPricingDate(pricingDate: Date): Promise<string> {
    const result = await this.wsp.getHttp({
      endpoint: this._pricingDatesEndpoint,
      params: {
        fields: ['pricingdate'],
        filters: [
          {
            key: 'pricingdate',
            type: 'LE',
            value: [moment(pricingDate).format('MM/DD/YYYY')]
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
    });

    return result[0].pricingdate;
  }

  async getPrices(pricingDate: Date, securityIds: string[]): Promise<Array<Price>> {
    const pricingDateString = moment(pricingDate).format('MM/DD/YYYY');

    const fields = [
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

    const prices = await this.wsp
      .getHttp<any[]>({
        endpoint: this._pricesEndpoint,
        params: {
          fields: fields,
          filters: [
            {
              key: 'pricedate',
              type: 'EQ',
              value: [pricingDateString]
            },
            {
              key: 'securityid',
              type: 'IN',
              value: securityIds
            }
          ]
        }
      });

    return prices.map(this.formatPrice);
  }

  async getPricingSources(): Promise<PricingSource[]> {
    const pricingSources = await this.wsp
      .getHttp<any[]>({
        endpoint: this._pricingSourcesEndpoint,
        params: {
          fields: ['id', 'name', 'manuallyinsertable', 'fileload', 'exclusive']
        }
      });

    return pricingSources.map(this.formatPricingSource);
  }

  async getPricingSourceBySourceTypeAndName(
    sourceType: string,
    name: string
  ): Promise<any> {
    const pricingSources = await this.wsp.getHttp<any[]>({
      endpoint: this._pricingSourcesEndpoint,
      params: {
        fields: ['id'],
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
    });

    return  pricingSources.length === 1 ? pricingSources[0] : null;
  }

  async savePrices(
    priceDate: Date,
    securityId,
    mid,
    source,
    evaltime,
    include
  ): Promise<Price> {
    const price = await this.wsp.postHttp({
      endpoint: this._pricesEndpoint,
      body: {
        pricedate: moment(priceDate).format('MM/DD/YYYY'),
        securityid: securityId.toString(),
        mid: mid.toString(),
        source: source.toString(),
        evaltime: evaltime,
        entrymethod: 'manual',
        include: include === true ? '1' : '0'
      }
    });

    return this.formatPrice(price);
  }

  async deletePrices(id: string): Promise<string> {
    return this.wsp.deleteHttp({
      endpoint: `${this._pricesEndpoint}/${id}`
    });
  }

  async savePricingSources(name: string): Promise<PricingSource> {
    const pricingSource = await this.wsp
      .postHttp<any>({
        endpoint: this._pricingSourcesEndpoint,
        body: {
          sourcetype: 'pricing',
          name: name,
          manuallyinsertable: '1',
          fileload: '0',
          exclusive: '0'
        }
      });

    return this.formatPricingSource(pricingSource);
  }

  async updatePrices(id: string, include: boolean): Promise<Price> {
    const prices = await this.wsp.putHttp({
      endpoint: this._pricesEndpoint,
      body: {
        id: id.toString(),
        include: include === true ? '1' : '0'
      }
    });

    return this.formatPrice(prices);
  }

  async saveComments(priceDate: Date, securityId, comment): Promise<PricingComment> {
    const priceDateString = moment(priceDate).format('MM/DD/YYYY');

    const entity = await this.wsp.postHttp({
      endpoint: this._priceCommentsEndpoint,
      body: {
        pricedate: priceDateString,
        securityid: securityId.toString(),
        comment: comment
      }
    });

    return this.formatPricingComment(entity);
  }

  async updateComments(
    priceDate: Date,
    securityId,
    comment,
    id
  ): Promise<PricingComment> {
    const priceDateString = moment(priceDate).format('MM/DD/YYYY');

    const price = await this.wsp.putHttp({
      endpoint: this._priceCommentsEndpoint,
      body: {
        pricedate: priceDateString,
        securityid: securityId,
        comment: comment,
        id: id
      }
    });

    return this.formatPricingComment(price);
  }

  async postCarryOverPrices(
    prevPricingDate: Date,
    pricingDate: Date,
    assettype
  ): Promise<any> {
    const prevPricingDateString = moment(prevPricingDate).format('MM/DD/YYYY');
    const pricingDateString = moment(pricingDate).format('MM/DD/YYYY');

    return this.wsp.postHttp({
      endpoint: this._pricesCarryOverEndpoint,
      body: {
        prevpricingdate: prevPricingDateString,
        pricingdate: pricingDateString,
        securitylist: 'manual',
        assettype: assettype
      }
    });
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

  private formatPricingSource(result: any): PricingSource {
    return new PricingSource(
      result.exclusive === 'True' ? true : false,
      result.fileload,
      result.id,
      result.manuallyinsertable === 'True' ? true : false,
      result.name
    );
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
}
