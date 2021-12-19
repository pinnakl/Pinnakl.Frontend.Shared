import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PinnaklSpinner, Toastr } from '@pnkl-frontend/core';
import { MarketService, PublicIdentifierService, Security, SecurityService, Utility } from '@pnkl-frontend/shared';
import { SecuritiesHelper } from '../../shared/securities-helper.service';
import { SecurityInformationComponent } from '../../shared/security-information.component';
import { TRS, TRSService } from '../trs-backend';

@Component({
  selector: 'trs-information',
  templateUrl: './trs-information.component.html',
  styleUrls: ['./trs-information.component.scss']
})
export class TrsInformationComponent extends SecurityInformationComponent {
  @Input() securitiesList: Security[] = [];
  filteredSecuritiesList: Security[] = [];
  cancelConfirmationVisible = false;
  trsToDelete: number;
  trsSelected: TRS;

  constructor(
    toastr: Toastr,
    router: Router,
    utility: Utility,
    marketService: MarketService,
    activatedRoute: ActivatedRoute,
    pinnaklSpinner: PinnaklSpinner,
    securityService: SecurityService,
    securitiesHelper: SecuritiesHelper,
    publicIdentifierService: PublicIdentifierService,
    protected _fb: FormBuilder,
    protected spinner: PinnaklSpinner,
    private readonly trsService: TRSService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super(
      activatedRoute,
      _fb,
      marketService,
      pinnaklSpinner,
      publicIdentifierService,
      router,
      securitiesHelper,
      securityService,
      toastr,
      utility
    );
  }

  protected createAssetForm(trs: TRS, fb: FormBuilder): FormGroup {
    if (!trs) {
      return fb.group({
        startDate: [, Validators.required],
        effectiveDate: [, Validators.required],
        terminationDate: [, Validators.required],
        baseRate: [, Validators.required],
        spread: [, Validators.required],
        dayCount: [, Validators.required],
        swapRefNo: [, Validators.required],
        resetIndicator: [, Validators.required],
        underlyingSecurity: [, Validators.required]
      });
    }

    return fb.group({
      startDate: [trs.startDate, Validators.required],
      effectiveDate: [trs.effectiveDate, Validators.required],
      terminationDate: [trs.terminationDate, Validators.required],
      baseRate: [trs.baseRate, Validators.required],
      spread: [trs.spread, Validators.required],
      dayCount: [trs.dayCount, Validators.required],
      swapRefNo: [trs.swapRefNo, Validators.required],
      resetIndicator: [trs.resetIndicator, Validators.required],
      underlyingSecurity: [
        this.securitiesList.find(s => s.id === trs.underlyingSecurityId)
        , Validators.required]
    });
  }

  protected ngOnInitFinishedHandler(): void {
    this.formValueChanges.subscribe(data => {
      if (data?.security?.securityTypeId) {
        const secTypeName = this.securityTypes
          .find(st => st.id === data.security.securityTypeId)
          .secTypeDescription.split(' ')[0].toLowerCase();
        this.filteredSecuritiesList = this.securitiesList.filter(s => s.assetType.toLowerCase() === secTypeName);
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  protected getUpdatedAsset(entity: TRS, existingEntity: TRS): TRS {
    return undefined;
  }

  protected postAsset(asset: TRS): Promise<TRS> {
    return this.trsService
      .post({
        ...asset,
        underlyingSecurityId: asset.underlyingSecurity.id
      })
      .then(trs => trs);
  }

  protected putAsset(asset: TRS): Promise<TRS> {
    return this.trsService.put({
      ...asset,
      underlyingSecurityId: asset.underlyingSecurity.id
    });
  }

  protected resetAssetForm(asset: TRS, form: FormGroup): void {
    console.log('resetAssetForm', asset);
  }
}
