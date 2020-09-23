import { Injectable } from '@angular/core';

import { GetWebRequest, PostWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { MarketFromApi } from '../../models/security/market-from-api.model';
import { Market } from '../../models/security/market.model';
import { SecurityMarketFromApi } from '../../models/security/security-market-from-api.model';
import { SecurityMarket } from '../../models/security/security-market.model';

@Injectable()
export class MarketService {
  private readonly MARKETS_URL = 'markets';
  private readonly SECURITY_MARKETS_URL = 'securitymarkets';

  private _markets: Market[];

  constructor(private wsp: WebServiceProvider) {}

  deleteSecurityMarket(id: number): Promise<void> {
    return this.wsp.delete({
      endPoint: this.SECURITY_MARKETS_URL,
      payload: {
        id: id.toString()
      }
    });
  }

  getMarkets(): Promise<Market[]> {
    if (this._markets) {
      return Promise.resolve(this._markets);
    }
    const fields = ['Country_Of_Quotation', 'Id', 'Mic'];

    const getWebRequest: GetWebRequest = {
      endPoint: this.MARKETS_URL,
      options: {
        fields: fields
      }
    };

    return this.wsp.get(getWebRequest).then((entities: MarketFromApi[]) => {
      this._markets = entities.map(entity => this.formatMarket(entity));
      return this._markets;
    });
  }

  getSecurityMarkets(securityId: number): Promise<SecurityMarket[]> {
    const fields = [
      'Active_Trading_Indicator',
      'Country_Of_Quotation',
      'Id',
      'MarketId',
      'Mic',
      'Primary_Market_Indicator',
      'SecurityId'
    ];

    const getWebRequest: GetWebRequest = {
      endPoint: this.SECURITY_MARKETS_URL,
      options: {
        fields: fields,
        filters: [
          {
            key: 'SecurityId',
            type: 'EQ',
            value: [securityId.toString()]
          }
        ]
      }
    };

    return this.wsp
      .get(getWebRequest)
      .then((entities: SecurityMarketFromApi[]) =>
        entities.map(entity => this.formatSecurityMarket(entity))
      );
  }

  postSecurityMarket(entityToSave: SecurityMarket): Promise<SecurityMarket> {
    let requestBody = this.getSecurityMarketForServiceRequest(entityToSave);

    let postWebRequest: PostWebRequest = {
      endPoint: this.SECURITY_MARKETS_URL,
      payload: requestBody
    };

    return this.wsp
      .post(postWebRequest)
      .then((entity: SecurityMarketFromApi) =>
        this.formatSecurityMarket(entity)
      );
  }

  putSecurityMarket(entityToSave: SecurityMarket): Promise<SecurityMarket> {
    let requestBody = this.getSecurityMarketForServiceRequest(entityToSave);
    return this.wsp
      .put({
        endPoint: this.SECURITY_MARKETS_URL,
        payload: requestBody
      })
      .then((entity: SecurityMarketFromApi) =>
        this.formatSecurityMarket(entity)
      );
  }

  private formatMarket(entity: MarketFromApi): Market {
    let id = parseInt(entity.id);
    return new Market(
      entity.country_of_quotation,
      !isNaN(id) ? id : null,
      entity.mic
    );
  }

  private formatSecurityMarket(entity: SecurityMarketFromApi): SecurityMarket {
    let id = parseInt(entity.id),
      marketId = parseInt(entity.marketid),
      securityId = parseInt(entity.securityid);
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
    let entityForApi = {} as SecurityMarketFromApi,
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
