import {
  Position,
  Price,
  PricingSource
} from '../models/pricing.model';
import {
  assetTypes,
  portfolio,
  prevPricingDate,
  prices,
  pricingDate,
  pricingSources
} from '../pinnakl-web-services/pricing-mock-data';

export class PricingServiceStub {
  getPortfolio(
    pricingDateParam: Date,
    prevPricingDateParam: Date,
    selectedAssetTypeParam: string
  ): Promise<Position[]> {
    return Promise.resolve(portfolio);
  }
  postCarryOverPrices(
    prevPricingDateParam: Date,
    pricingDateParam: Date,
    selectedAssetType: string
  ): Promise<any> {
    return Promise.resolve('');
  }
  getPrices(pricingDateParam: Date, securityId: string): Promise<Price[]> {
    return Promise.resolve(prices);
  }
  getPricingSources(): Promise<PricingSource[]> {
    return Promise.resolve(pricingSources);
  }
}

export const PricingMockData = {
  assetTypes: assetTypes,
  pricingDate: pricingDate,
  prevPricingDate: prevPricingDate
};
