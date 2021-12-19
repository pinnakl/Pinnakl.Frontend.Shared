import { Injectable } from '@angular/core';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { Market } from '../../models/security';
import { SecurityMarket } from '../../models/security';
import { MarketFromApi } from '../../models/security/market-from-api.model';
import { SecurityMarketFromApi } from '../../models/security/security-market-from-api.model';

@Injectable()
export class MarketService {
  private readonly _marketsEndpoint = 'entities/markets';
  private readonly _securityMarketsEndpoint = 'entities/securitymarkets';

  private _markets: Market[];

  constructor(private readonly wsp: WebServiceProvider) { }

  deleteSecurityMarket(id: number): Promise<void> {
    return this.wsp.deleteHttp({
      endpoint: `${this._securityMarketsEndpoint}/${id}`
    });
  }

  async getMarkets(): Promise<Market[]> {
    if (this._markets) {
      return Promise.resolve(this._markets);
    }
    const fields = ['Country_Of_Quotation', 'Id', 'Mic'];
    const markets = await this.wsp.getHttp<MarketFromApi[]>({
      endpoint: this._marketsEndpoint,
      params: {
        fields: fields
      }
    });

    this._markets = markets.map(entity => this.formatMarket(entity));
    return this._markets;
  }

  async getSecurityMarkets(securityId: number): Promise<SecurityMarket[]> {
    const fields = [
      'Active_Trading_Indicator',
      'Country_Of_Quotation',
      'Id',
      'MarketId',
      'Mic',
      'Primary_Market_Indicator',
      'SecurityId'
    ];

    const securityMarkets = await this.wsp.getHttp<SecurityMarketFromApi[]>({
      endpoint: this._securityMarketsEndpoint,
      params: {
        fields: fields,
        filters: [
          {
            key: 'SecurityId',
            type: 'EQ',
            value: [securityId.toString()]
          }
        ]
      }
    });

    return securityMarkets.map(securityMarket =>
      this.formatSecurityMarket(securityMarket)
    );
  }

  async postSecurityMarket(entityToSave: SecurityMarket): Promise<SecurityMarket> {
    const entity = await this.wsp.postHttp<SecurityMarketFromApi>({
      endpoint: this._securityMarketsEndpoint,
      body: this.getSecurityMarketForServiceRequest(entityToSave)
    });

    return this.formatSecurityMarket(entity);
  }

  async putSecurityMarket(entityToSave: SecurityMarket): Promise<SecurityMarket> {
    const entity = await this.wsp.putHttp<SecurityMarketFromApi>({
      endpoint: this._securityMarketsEndpoint,
      body: this.getSecurityMarketForServiceRequest(entityToSave)
    });

    return this.formatSecurityMarket(entity);
  }

  private formatMarket(entity: MarketFromApi): Market {
    const id = parseInt(entity.id, 10);
    return new Market(
      entity.country_of_quotation,
      !isNaN(id) ? id : null,
      entity.mic
    );
  }

  private formatSecurityMarket(entity: SecurityMarketFromApi): SecurityMarket {
    const id = parseInt(entity.id, 10),
      marketId = parseInt(entity.marketid, 10),
      securityId = parseInt(entity.securityid, 10);
    return new SecurityMarket(
      entity.active_trading_indicator === 'True',
      entity.country_of_quotation,
      !isNaN(id) ? id : null,
      !isNaN(marketId) ? marketId : null,
      entity.mic,
      entity.primary_market_indicator === 'True',
      !isNaN(securityId) ? securityId : null
    );
  }

  private getSecurityMarketForServiceRequest(
    entity: SecurityMarket
  ): SecurityMarketFromApi {
    const entityForApi = {} as SecurityMarketFromApi,
      {
        activeTradingIndicator,
        id,
        marketId,
        primaryMarketIndicator,
        securityId
      } = entity;
    if (activeTradingIndicator !== undefined) {
      entityForApi.active_trading_indicator = activeTradingIndicator
        ? '1'
        : '0';
    }
    if (id !== undefined) {
      entityForApi.id = id.toString();
    }
    if (marketId !== undefined) {
      entityForApi.marketid = marketId.toString();
    }
    if (primaryMarketIndicator !== undefined) {
      entityForApi.primary_market_indicator = primaryMarketIndicator
        ? '1'
        : '0';
    }
    if (securityId !== undefined) {
      entityForApi.securityid = securityId.toString();
    }
    return entityForApi;
  }
}
