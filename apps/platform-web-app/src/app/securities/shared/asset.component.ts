import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CurrencyForOMS, Organization, Security, SecurityAttributeOption, SecurityType } from '@pnkl-frontend/shared';

import { SecuritiesHelper } from '../shared/securities-helper.service';

@Component({ template: '' })
export abstract class AssetComponent<T = any> implements OnInit {
  currencies: CurrencyForOMS[];
  manualSecuritySource: number;
  organizations: Organization[];
  sectorOptions: SecurityAttributeOption[];
  security: Security;
  securityTypes: SecurityType[];
  constructor(
    private activatedRoute: ActivatedRoute,
    public securitiesHelper: SecuritiesHelper
  ) {}
  ngOnInit(): void {
    Object.assign(this, this.activatedRoute.snapshot.data.resolvedData);
    const securityDetailsResolvedData = this
      .securitiesHelper.securityDetailsResolvedData;
    this.currencies = securityDetailsResolvedData.currencies;
    this.manualSecuritySource =
      securityDetailsResolvedData.manualSecuritySource;
    this.organizations = securityDetailsResolvedData.organizations;
    this.sectorOptions = securityDetailsResolvedData.sectorOptions;
    this.security = securityDetailsResolvedData.security;
    this.securityTypes = securityDetailsResolvedData.securityTypes;
  }
}
