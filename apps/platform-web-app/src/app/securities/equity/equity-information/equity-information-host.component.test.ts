import { Component, ViewChild } from '@angular/core';

import { Equity } from '@pnkl-frontend/shared';
import { SecurityAttributeOption } from '@pnkl-frontend/shared';
import {
  CURRENCIES,
  ORGANIZATIONS,
  SECTOR_OPTIONS,
  SECURITY_TYPES
} from '../../securities-helper.service.spec';
import { EquityInformationComponent } from './equity-information.component';

import { CurrencyForOMS } from '@pnkl-frontend/shared';
import { Organization } from '@pnkl-frontend/shared';
import { SecurityType } from '@pnkl-frontend/shared';
import { Security } from '@pnkl-frontend/shared';

const SECURITY = {
  assetType: 'equity',
  assetTypeId: 6,
  countryOfIncorporation: 'US',
  countryOfRisk: 'US',
  currency: 'USD',
  currencyId: 21,
  cusip: '829226109',
  dataSourceId: 3,
  description: 'Sinclair Broad-a',
  id: 2,
  isin: '',
  loanId: '',
  manualPricingIndicator: false,
  moodyRating: '',
  multiplier: 1,
  opraCode: '',
  organizationId: 446,
  organizationName: 'Sinclair Broad-a',
  organizationStatusDescription: 'Live',
  organizationStatusId: '6',
  organizationTicker: 'sbgi',
  privateIndicator: false,
  sandpRating: '',
  sector: 'Communications',
  securityType: 'equity',
  securityTypeDescription: 'Equity',
  securityTypeId: 1,
  sedol: '2799351',
  ticker: 'sbgi',
  principalFactor: 1
};

const ASSET = {
  defaultIndicator: false,
  dividendFrequencyId: 3,
  dividendRate: 0.18,
  id: 170,
  securityId: 2,
  sharesOutstanding: 69315000
};

@Component({
  template: `
    <equity-information
      [asset]="equity"
      [currencies]="currencies"
      [dividendFrequencyOptions]="dividendFrequencyOptions"
      [manualSecuritySource]="manualSecuritySource"
      [organizations]="organizations"
      [sectorOptions]="sectorOptions"
      [security]="security"
      [securityTypes]="securityTypes"
    >
    </equity-information>
  `
})
export class EquityInformationHostComponent {
  equity: Equity;
  dividendFrequencyOptions: SecurityAttributeOption[];

  currencies: CurrencyForOMS[];
  manualSecuritySource: number;
  organizations: Organization[];
  sectorOptions: SecurityAttributeOption[];
  security: Security;
  securityTypes: SecurityType[];

  @ViewChild(EquityInformationComponent, { static: true })
  public assetInfoComponent: EquityInformationComponent;

  constructor() {
    this.configureSecurityInputs();
    this.configureAssetSecificInputs();
  }

  configureSecurityInputs(): void {
    this.currencies = CURRENCIES;
    this.organizations = ORGANIZATIONS;
    this.sectorOptions = SECTOR_OPTIONS;
    this.securityTypes = SECURITY_TYPES.filter(
      sec => sec.assetTypeId === SECURITY.assetTypeId
    );
  }

  configureAssetSecificInputs(): void {
    this.security = SECURITY as Security;
    this.equity = ASSET as Equity;
    this.manualSecuritySource = 45;

    this.dividendFrequencyOptions = [];
  }
}
