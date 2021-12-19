import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import * as _ from 'lodash';
import { Subscription } from 'rxjs';

import { AdminAccount } from '@pnkl-frontend/shared';
import { ClientConnectivity } from '@pnkl-frontend/shared';
import { GenericEntityWithName } from '@pnkl-frontend/shared';
import { AdminIdentifier } from '@pnkl-frontend/shared';
import { CustomAttributeValue } from '@pnkl-frontend/shared';
import { CustomAttribute } from '@pnkl-frontend/shared';
import { Market } from '@pnkl-frontend/shared';
import { PbIdentifier } from '@pnkl-frontend/shared';
import { PublicIdentifier } from '@pnkl-frontend/shared';
import { SecurityMarket } from '@pnkl-frontend/shared';
import { Security } from '@pnkl-frontend/shared';
import { SecuritiesHelper } from '../shared/securities-helper.service';
import { SecurityDetailsResolvedData } from './security-details-resolved-data.model';

@Component({
  selector: 'security-details',
  templateUrl: 'security-details.component.html',
  styleUrls: ['./security-details.component.scss'],
  animations: [
    trigger('isHistoryVisible', [
      state('*', style({ opacity: 1 })),
      state('void', style({ opacity: 0 })),
      transition('* => *', animate('400ms'))
    ])
  ]
})
export class SecurityDetailsComponent implements OnDestroy, OnInit {
  additionalInformationTabVisible = false;
  adminAccounts: AdminAccount[];
  adminIdentifiers: AdminIdentifier[];
  assetType: string;
  clientConnectivities: ClientConnectivity[];
  customAttributes: CustomAttribute[];
  customAttributeValues: CustomAttributeValue[];
  markets: Market[];
  publicIdentifierTypes: GenericEntityWithName[];
  pbIdentifiers: PbIdentifier[];
  publicIdentifiers: PublicIdentifier[];
  searchSecurityForm: FormGroup;
  securities: Security[];
  security: Security;
  isHistoryVisible = false;
  // isHistoryVisible = true;
  private securityChangedSubscription: Subscription;
  securityMarkets: SecurityMarket[];
  pageWidth = 60;
  sliderWidth = 40;
  showSlider = false;
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly fb: FormBuilder,
    private readonly router: Router,
    public securitiesHelper: SecuritiesHelper
  ) {}

  ngOnDestroy(): void {
    if (this.securityChangedSubscription) {
      this.securityChangedSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.setResolveDataToProperties();
    const assetType: string = this.activatedRoute.snapshot.params.assetType;
    this.assetType = assetType;
    this.additionalInformationTabVisible = !_.includes(
      ['peloan', 'cds', 'claim', 'crncy', 'equity', 'fund', 'future', 'trs'],
      assetType
    );
    this.securitiesHelper.currentTab = 'securityInformation';
    const security = this.security;
    if (security) {
      this.searchSecurityForm = this.fb.group({
        security: [security]
      });
      this.securityChangedSubscription = this.searchSecurityForm.controls.security.valueChanges.subscribe(
        (selectedSecurity: Security) => {
          if (!selectedSecurity) {
            return;
          }
          this.router.navigate([
            'securities/security-details',
            selectedSecurity.assetTypeId,
            selectedSecurity.assetType,
            { securityId: selectedSecurity.id }
          ]);
        }
      );
    }
    this.router.navigate([assetType], {
      relativeTo: this.activatedRoute,
      skipLocationChange: true
    });
  }

  switchToTab(clickedTab: string): void {
    this.securitiesHelper.currentTab = clickedTab;
  }

  toggleHistory(): void {
    this.isHistoryVisible = !this.isHistoryVisible;
    this.showSlider = !this.showSlider;
  }

  private setResolveDataToProperties(): void {
    const resolvedData: SecurityDetailsResolvedData = (
      this.securitiesHelper.securityDetailsResolvedData = this.activatedRoute.snapshot.data.resolvedData
    );
    this.adminAccounts = resolvedData.adminAccounts;
    this.adminIdentifiers = resolvedData.adminIdentifiers;
    this.clientConnectivities = resolvedData.clientConnectivities;
    this.customAttributes = resolvedData.customAttributes;
    this.customAttributeValues = resolvedData.customAttributeValues;
    this.markets = resolvedData.markets;
    this.pbIdentifiers = resolvedData.pbIdentifiers;
    this.publicIdentifiers = resolvedData.publicIdentifiers;
    this.publicIdentifierTypes = resolvedData.publicIdentifierTypes;
    this.securities = resolvedData.securities;
    this.security = resolvedData.security;
    this.securityMarkets = resolvedData.securityMarkets;
  }
}
