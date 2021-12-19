import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import * as _ from 'lodash';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import { Toastr } from '@pnkl-frontend/core';
import { Preferred } from '@pnkl-frontend/shared';
import { PreferredService } from '@pnkl-frontend/shared';
import { Utility } from '@pnkl-frontend/shared';
import { AssetAdditionalInformationComponent } from '../../shared/asset-additional-information.component';
import { SecuritiesHelper } from '../../shared/securities-helper.service';

@Component({
  selector: 'preferred-additional-information',
  templateUrl: 'preferred-additional-information.component.html'
})
export class PreferredAdditionalInformationComponent extends AssetAdditionalInformationComponent {
  constructor(
    fb: FormBuilder,
    pinnaklSpinner: PinnaklSpinner,
    toastr: Toastr,
    utility: Utility,
    private readonly preferredService: PreferredService,
    securitiesHelper: SecuritiesHelper
  ) {
    super(fb, pinnaklSpinner, securitiesHelper, toastr, utility);
  }

  protected getUpdatedAsset(
    entity: Preferred,
    existingEntity: Preferred
  ): Preferred {
    const updatedEntity = {} as Preferred;
    const convertibleIndicator = !!entity.convertibleIndicator;
    if (convertibleIndicator !== existingEntity.convertibleIndicator) {
      updatedEntity.convertibleIndicator = convertibleIndicator;
    }
    const defaultIndicator = !!entity.defaultIndicator;
    if (defaultIndicator !== existingEntity.defaultIndicator) {
      updatedEntity.defaultIndicator = defaultIndicator;
    }
    if (_.isEqual(updatedEntity, {})) {
      return null;
    }
    updatedEntity.id = existingEntity.id;
    return updatedEntity;
  }

  protected initializeForm(): void {
    this.form = this.fb.group({
      convertibleIndicator: [],
      defaultIndicator: []
    });
  }

  protected patchFormValue(): void {
    const asset = this.asset as Preferred;
    this.form.patchValue({
      convertibleIndicator: asset.convertibleIndicator,
      defaultIndicator: asset.defaultIndicator
    });
  }

  protected saveAsset(asset: Preferred): Promise<Preferred> {
    return this.preferredService.putPreferred(asset);
  }
}
