import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import * as _ from 'lodash';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import { Toastr } from '@pnkl-frontend/core';
import { Option } from '@pnkl-frontend/shared';
import { OptionService } from '@pnkl-frontend/shared';
import { Utility } from '@pnkl-frontend/shared';
import { AssetAdditionalInformationComponent } from '../../shared/asset-additional-information.component';
import { SecuritiesHelper } from '../../shared/securities-helper.service';

@Component({
  selector: 'option-additional-information',
  templateUrl: 'option-additional-information.component.html'
})
export class OptionAdditionalInformationComponent extends AssetAdditionalInformationComponent {
  constructor(
    fb: FormBuilder,
    pinnaklSpinner: PinnaklSpinner,
    toastr: Toastr,
    utility: Utility,
    private readonly optionService: OptionService,
    securitiesHelper: SecuritiesHelper
  ) {
    super(fb, pinnaklSpinner, securitiesHelper, toastr, utility);
  }

  protected getUpdatedAsset(entity: Option, existingEntity: Option): Option {
    const updatedEntity = {} as Option;
    const underlyingSecurityId = entity.underlyingSecurityId;
    if (
      !this.utility.compareNumeric(
        underlyingSecurityId,
        existingEntity.underlyingSecurityId
      )
    ) {
      updatedEntity.underlyingSecurityId = underlyingSecurityId;
    }
    if (_.isEqual(updatedEntity, {})) {
      return null;
    }
    updatedEntity.id = existingEntity.id;
    return updatedEntity;
  }

  protected initializeForm(): void {
    this.form = this.fb.group({
      underlyingSecurityId: []
    });
  }

  protected patchFormValue(): void {
    const asset = this.asset as Option;
    this.form.patchValue({
      underlyingSecurityId: asset.underlyingSecurityId
    });
  }

  protected saveAsset(asset: Option): Promise<Option> {
    return this.optionService.putOption(asset);
  }
}
