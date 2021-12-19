import { Component, ViewChild } from '@angular/core';

import { Currency } from '@pnkl-frontend/shared';
import { SecurityAttributeOption } from '@pnkl-frontend/shared';
import {
  CURRENCIES,
  ORGANIZATIONS,
  SECTOR_OPTIONS,
  SECURITY_TYPES
} from '../../securities-helper.service.spec';
import { CurrencyInformationComponent } from './currency-information.component';

import { CurrencyForOMS as GlobalCurrency } from '@pnkl-frontend/shared';
import { Organization } from '@pnkl-frontend/shared';
import { SecurityType } from '@pnkl-frontend/shared';
import { Security } from '@pnkl-frontend/shared';

const SECURITY = {
  assetType: 'crncy',
  assetTypeId: 11,
  countryOfIncorporation: 'US',
  countryOfRisk: 'US',
  currency: 'GBP',
  currencyId: 8,
  cusip: '',
  dataSourceId: 3,
  description: 'GBP/USD',
  id: 73,
  isin: '',
  loanId: '',
  manualPricingIndicator: false,
  moodyRating: '',
  multiplier: 1,
  opraCode: '',
  organizationId: 237,
  organizationName: 'GBP/USD',
  organizationStatusDescription: 'Live',
  organizationStatusId: '6',
  organizationTicker: 'gbp/usd',
  privateIndicator: false,
  sandpRating: '',
  sector: 'Energy',
  securityType: 'spot',
  securityTypeDescription: 'Spot',
  securityTypeId: 12,
  sedol: '',
  ticker: 'GBP/USD',
  principalFactor: 1
};

const ASSET = {
  forwardPrice: null,
  id: 1,
  maturity: new Date('10/24/2017'),
  secondaryCurrencyId: 21,
  securityId: 73
};

@Component({
  template: `
    <currency-information
      [asset]="currency"
      [currencies]="currencies"
      [manualSecuritySource]="manualSecuritySource"
      [organizations]="organizations"
      [sectorOptions]="sectorOptions"
      [security]="security"
      [securityTypes]="securityTypes"
    >
    </currency-information>
  `
})
export class CurrencyInformationHostComponent {
  currency: Currency;

  currencies: GlobalCurrency[];
  manualSecuritySource: number;
  organizations: Organization[];
  sectorOptions: SecurityAttributeOption[];
  security: Security;
  securityTypes: SecurityType[];

  @ViewChild(CurrencyInformationComponent, { static: true })
  public assetInfoComponent: CurrencyInformationComponent;

  constructor() {
    this.configureSecurityInputs();
    this.configureAssetSecificInputs();
  }

  configureSecurityInputs(): void {
    this.currencies = CURRENCIES;
    this.organizations = ORGANIZATIONS;
    this.sectorOptions = SECTOR_OPTIONS;
    this.securityTypes = SECURITY_TYPES;
  }

  configureAssetSecificInputs(): void {
    this.security = SECURITY as Security;
    // this.currency = ASSET as Currency;
    this.manualSecuritySource = 45;
  }
}
