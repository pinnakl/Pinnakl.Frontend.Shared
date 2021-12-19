import { Component, ViewChild } from '@angular/core';

import { SecurityAttributeOption } from '@pnkl-frontend/shared';
import {
  CURRENCIES,
  ORGANIZATIONS,
  SECTOR_OPTIONS,
  SECURITY_TYPES
} from '../../securities-helper.service.spec';
import { ClaimInformationComponent } from './claim-information.component';

import { CurrencyForOMS } from '@pnkl-frontend/shared';
import { Organization } from '@pnkl-frontend/shared';
import { SecurityType } from '@pnkl-frontend/shared';
import { Security } from '@pnkl-frontend/shared';

const SECURITY = {
  assetType: 'claim',
  assetTypeId: 4,
  countryOfIncorporation: 'US',
  countryOfRisk: 'US',
  currency: 'USD',
  currencyId: 21,
  cusip: '',
  dataSourceId: 3,
  description: 'Mf Global 30.7 Claim',
  id: 100,
  isin: '',
  loanId: '',
  manualPricingIndicator: false,
  moodyRating: '',
  multiplier: 0.01,
  opraCode: '',
  organizationId: 343,
  organizationName: 'Mf Global Revolver Ext Guar 2014',
  organizationStatusDescription: 'Live',
  organizationStatusId: '6',
  organizationTicker: 'mf',
  privateIndicator: false,
  sandpRating: '',
  sector: 'Financial',
  securityType: 'claim',
  securityTypeDescription: 'Claim',
  securityTypeId: 11,
  sedol: '',
  ticker: 'mf',
  principalFactor: 1
};

@Component({
  template: `
    <claim-information
      [currencies]="currencies"
      [manualSecuritySource]="manualSecuritySource"
      [organizations]="organizations"
      [sectorOptions]="sectorOptions"
      [security]="security"
      [securityTypes]="securityTypes"
    >
    </claim-information>
  `
})
export class ClaimInformationHostComponent {
  currencies: CurrencyForOMS[];
  manualSecuritySource: number;
  organizations: Organization[];
  sectorOptions: SecurityAttributeOption[];
  security: Security;
  securityTypes: SecurityType[];

  @ViewChild(ClaimInformationComponent, { static: true })
  public assetInfoComponent: ClaimInformationComponent;

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
    this.manualSecuritySource = 45;
  }
}
