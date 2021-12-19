import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import * as _ from 'lodash';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import { Toastr } from '@pnkl-frontend/core';
import { Currency } from '@pnkl-frontend/shared';
import { Organization } from '@pnkl-frontend/shared';
import { PublicIdentifier } from '@pnkl-frontend/shared';
import { SecurityAttributeOption } from '@pnkl-frontend/shared';
import { SecurityMarket } from '@pnkl-frontend/shared';
import { SecurityType } from '@pnkl-frontend/shared';
import { Security } from '@pnkl-frontend/shared';
import { MarketService } from '@pnkl-frontend/shared';
import { PublicIdentifierService } from '@pnkl-frontend/shared';
import { SecurityService } from '@pnkl-frontend/shared';
import { Utility } from '@pnkl-frontend/shared';
import { Observable } from 'rxjs';
import { SecuritiesHelper } from './securities-helper.service';

type Asset = { id: number; securityId: number }; // tslint:disable-line:interface-over-type-literal

@Component({ template: '' })
export abstract class SecurityInformationComponent<T = any> implements OnInit {
  cancelConfirmationVisible = false;
  @Input() currencies: Currency[];
  form: FormGroup;
  @Input() private manualSecuritySource: number;
  @Input() organizations: Organization[];
  @Input() sectorOptions: SecurityAttributeOption[];
  @Input() public security: Security;
  @Input() securityTypes: SecurityType[];
  initialSecurityValues: Partial<Security> = {};
  submitted = false;

  @Input() public asset: Asset;
  protected formValueChanges: Observable<any>;
  private readonly errorHandler: any;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly fb: FormBuilder,
    private readonly marketService: MarketService,
    private readonly pinnaklSpinner: PinnaklSpinner,
    private readonly publicIdentifierService: PublicIdentifierService,
    private readonly router: Router,
    private readonly securitiesHelper: SecuritiesHelper,
    private readonly securityService: SecurityService,
    private readonly toastr: Toastr,
    protected utility: Utility
  ) {
    this.errorHandler = this.utility.errorHandler.bind(this);
  }

  cancelReset(): void {
    this.cancelConfirmationVisible = false;
  }

  ngOnInit(): void {
    this.initiateDefaultSecurityValues();
    this.form = this.fb.group({
      asset: this.createAssetForm(this.asset, this.fb),
      security: this.securitiesHelper.createSecurityForm(
        this.fb,
        this.manualSecuritySource,
        this.sectorOptions,
        this.security,
        this.initialSecurityValues
      )
    });
    this.formValueChanges = this.form.valueChanges;
    const assetType = this.activatedRoute.snapshot.url.toString();
    if (
      _.includes(['bankdebt', 'claim', 'equity', 'future', 'cds', 'trs'], assetType)
    ) {
      this.form.controls.security.patchValue({
        securityTypeId: this.securityTypes[0].id
      });
    }
    if (this.security && assetType !== 'claim') {
      this.securitiesHelper.assetId = this.asset.id;
    }
    this.ngOnInitFinishedHandler();
  }

  resetForm(): void {
    this.submitted = false;
    this.cancelConfirmationVisible = false;
    this.form.reset();
    if (this.security) {
      this.resetAssetForm(this.asset, this.form);
      this.securitiesHelper.resetSecurityForm(
        this.form,
        this.sectorOptions,
        this.security
      );
    }
  }

  saveInformation(): void {
    this.submitted = true;
    if (!this.form.valid) {
      return;
    }
    const { asset, security } = this.form.value as {
      asset: Asset;
      security: Security;
    };
    if (!this.security) {
      this.postInformation(asset, security);
    } else {
      this.putInformation(asset, security);
    }
  }

  showFormCancelConfirmation(): void {
    this.cancelConfirmationVisible = true;
  }

  // Can be overloaded in child component to allow set default values for security form group
  protected initiateDefaultSecurityValues(): void {
    this.initialSecurityValues = {};
  }

  protected ngOnInitFinishedHandler(): void {
    return null;
  }

  protected abstract createAssetForm(asset: Asset, fb: FormBuilder): FormGroup;

  protected abstract getUpdatedAsset(
    entity: Asset,
    existingEntity: Asset
  ): Asset;

  protected abstract postAsset(asset: Asset): Promise<Asset>;

  protected abstract putAsset(asset: Asset): Promise<Asset>;

  protected abstract resetAssetForm(asset: Asset, form: FormGroup): void;

  private postInformation(asset: Asset, securityToSave: Security): void {
    this.pinnaklSpinner.spin();
    this.securityService
      .postSecurity(securityToSave)
      .then(security => {
        const securityId = security.id,
          organization = _.find(this.organizations, {
            id: security.organizationId
          });
        if (!organization || !organization.ticker) {
          return Promise.reject({ clientMessage: 'Invalid Organization' });
        }
        const securityMarket = {
            activeTradingIndicator: true,
            marketId: 1,
            primaryMarketIndicator: true,
            securityId
          } as SecurityMarket,
          publicIdentifier = {
            identifier: organization.ticker.toUpperCase(),
            identifierType: 'Ticker',
            marketId: 1,
            securityId
          } as PublicIdentifier;
        asset.securityId = securityId;
        return Promise.all([
          security,
          this.postAsset(asset),
          this.marketService.postSecurityMarket(securityMarket),
          this.publicIdentifierService.postIdentifier(publicIdentifier)
        ]);
      })
      .then(result => {
        const security = result[0];
        this.toastr.success('Security saved successfully');
        this.pinnaklSpinner.stop();
        this.router.navigate([
          'securities/security-details',
          security.assetTypeId,
          security.assetType,
          { securityId: security.id }
        ]);
      })
      .catch(this.errorHandler);
  }

  private putInformation(assetToSave: Asset, securityToSave: Security): void {
    const updatedAsset = this.getUpdatedAsset(assetToSave, this.asset),
      updatedSecurity = this.securitiesHelper.getUpdatedSecurity(
        securityToSave,
        this.security
      );
    if (!updatedAsset && !updatedSecurity) {
      this.toastr.error('No changes to update');
      return;
    }
    this.pinnaklSpinner.spin();
    Promise.all([
      updatedAsset ? this.putAsset(updatedAsset) : this.asset,
      updatedSecurity
        ? this.securityService.putSecurity(updatedSecurity)
        : this.security
    ])
      .then(result => {
        this.pinnaklSpinner.stop();
        this.toastr.success('Security saved successfully');
        const [asset, security] = result;
        this.asset = asset;
        this.security = security;
        this.resetForm();
        this.securitiesHelper.formSubmitted.next();
      })
      .catch(this.errorHandler);
  }
}
