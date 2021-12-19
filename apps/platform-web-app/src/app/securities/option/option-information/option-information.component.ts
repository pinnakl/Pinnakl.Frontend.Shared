import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import * as _ from 'lodash';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import { Toastr } from '@pnkl-frontend/core';
import { Option } from '@pnkl-frontend/shared';
import { SecurityAttributeOption } from '@pnkl-frontend/shared';
import { MarketService } from '@pnkl-frontend/shared';
import { OptionService } from '@pnkl-frontend/shared';
import { PublicIdentifierService } from '@pnkl-frontend/shared';
import { SecurityService } from '@pnkl-frontend/shared';
import { Utility } from '@pnkl-frontend/shared';
import { SecuritiesHelper } from '../../shared/securities-helper.service';
import { SecurityInformationComponent } from '../../shared/security-information.component';

@Component({
  selector: 'option-information',
  templateUrl: 'option-information.component.html'
})
export class OptionInformationComponent extends SecurityInformationComponent {
  @Input() optionTypeOptions: SecurityAttributeOption[];
  @Input() putCallIndicatorOptions: SecurityAttributeOption[];

  constructor(
    activatedRoute: ActivatedRoute,
    fb: FormBuilder,
    marketService: MarketService,
    pinnaklSpinner: PinnaklSpinner,
    publicIdentifierService: PublicIdentifierService,
    router: Router,
    securitiesHelper: SecuritiesHelper,
    securityService: SecurityService,
    toastr: Toastr,
    utility: Utility,
    private readonly optionService: OptionService
  ) {
    super(
      activatedRoute,
      fb,
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

  protected createAssetForm(option: Option, fb: FormBuilder): FormGroup {
    if (!option) {
      return fb.group({
        contractSize: [],
        maturity: [],
        optionType: [],
        putCallIndicator: [],
        strike: []
      });
    }
    return fb.group({
      contractSize: [option.contractSize],
      maturity: [option.maturity],
      optionType: [option.optionType],
      putCallIndicator: [option.putCallIndicator],
      strike: [option.strike]
    });
  }

  protected getUpdatedAsset(entity: Option, existingEntity: Option): Option {
    const updatedEntity = {} as Option;
    const contractSize = entity.contractSize;
    if (
      !this.utility.compareNumeric(contractSize, existingEntity.contractSize)
    ) {
      updatedEntity.contractSize = contractSize;
    }
    const maturity = entity.maturity;
    if (!this.utility.compareDates(maturity, existingEntity.maturity)) {
      updatedEntity.maturity = maturity;
    }
    const optionType = entity.optionType;
    if (!this.utility.compareStrings(optionType, existingEntity.optionType)) {
      updatedEntity.optionType = optionType;
    }
    const putCallIndicator = entity.putCallIndicator;
    if (
      !this.utility.compareStrings(
        putCallIndicator,
        existingEntity.putCallIndicator
      )
    ) {
      updatedEntity.putCallIndicator = putCallIndicator;
    }
    const strike = entity.strike;
    if (!this.utility.compareNumeric(strike, existingEntity.strike)) {
      updatedEntity.strike = strike;
    }
    if (_.isEqual(updatedEntity, {})) {
      return null;
    }
    updatedEntity.id = existingEntity.id;
    return updatedEntity;
  }

  protected postAsset(option: Option): Promise<Option> {
    return this.optionService.postOption(option);
  }

  protected putAsset(option: Option): Promise<Option> {
    return this.optionService.putOption(option);
  }

  protected resetAssetForm(option: Option, form: FormGroup): void {
    form.patchValue({
      asset: {
        contractSize: option.contractSize,
        maturity: option.maturity,
        optionType: option.optionType,
        putCallIndicator: option.putCallIndicator,
        strike: option.strike
      }
    });
  }
}
