import { Component, ViewChild } from '@angular/core';

import { Bond } from '@pnkl-frontend/shared';
import { SecurityAttributeOption } from '@pnkl-frontend/shared';
import {
  CURRENCIES,
  ORGANIZATIONS,
  SECTOR_OPTIONS,
  SECURITY_TYPES
} from '../../securities-test-helper';
import { BondInformationComponent } from './bond-information.component';

import { CurrencyForOMS } from '@pnkl-frontend/shared';
import { Organization } from '@pnkl-frontend/shared';
import { SecurityType } from '@pnkl-frontend/shared';
import { Security } from '@pnkl-frontend/shared';

const SECURITY = {
  assetType: 'bond',
  assetTypeId: 2,
  countryOfIncorporation: 'CA',
  countryOfRisk: 'CA',
  currency: 'USD',
  currencyId: 21,
  cusip: '',
  dataSourceId: 3,
  description: 'Petrominerales 2.625% 08/25/16',
  id: 15,
  isin: 'NO0010583990',
  loanId: '',
  manualPricingIndicator: false,
  moodyRating: '',
  multiplier: 0.01,
  opraCode: '',
  organizationId: 411,
  organizationName: 'Petrominerales L',
  organizationStatusDescription: 'Live',
  organizationStatusId: '6',
  organizationTicker: 'pmg cn',
  privateIndicator: false,
  sandpRating: '',
  sector: 'Energy',
  securityType: 'conv',
  securityTypeDescription: 'Convertible Bond',
  securityTypeId: 3,
  sedol: 'B50NST8',
  ticker: 'pmg cn',
  principalFactor: 12
};

const ASSET = {
  accruingIndicator: true,
  bond144aIndicator: false,
  callIndicator: true,
  convertibleIndicator: true,
  couponRate: 2.625,
  couponTypeId: 8,
  defaultIndicator: false,
  firstAccrualDate: null,
  firstCouponDate: null,
  id: 1723,
  interestBasisId: 5,
  issueAmount: null,
  maturityDate: new Date('2017-12-08'),
  minPiece: 100000,
  nominalValue: 100000,
  outstandingAmount: 0,
  paymentFrequencyId: 2,
  pikIndicator: false,
  principalFactor: 12,
  putIndicator: true,
  securityId: 15,
  sinkIndicator: false,
  strippableIndicator: false,
  underlyingSecurityId: 354
};

@Component({
  template: `
    <bond-information
      [asset]="bond"
      [couponTypes]="couponTypes"
      [currencies]="currencies"
      [interestBasisOptions]="interestBasisOptions"
      [manualSecuritySource]="manualSecuritySource"
      [organizations]="organizations"
      [paymentFrequencyOptions]="paymentFrequencyOptions"
      [sectorOptions]="sectorOptions"
      [security]="security"
      [securityTypes]="securityTypes"
    >
    </bond-information>
  `
})
export class BondInformationHostComponent {
  bond: Bond;
  couponTypes: SecurityAttributeOption[];
  interestBasisOptions: SecurityAttributeOption[];
  paymentFrequencyOptions: SecurityAttributeOption[];

  currencies: CurrencyForOMS[];
  manualSecuritySource: number;
  organizations: Organization[];
  sectorOptions: SecurityAttributeOption[];
  security: Security;
  securityTypes: SecurityType[];

  @ViewChild(BondInformationComponent, { static: true })
  public assetInfoComponent: BondInformationComponent;

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
    this.bond = ASSET as Bond;
    this.manualSecuritySource = 45;

    this.couponTypes = [];
    this.interestBasisOptions = [];
    this.paymentFrequencyOptions = [];
  }
}
