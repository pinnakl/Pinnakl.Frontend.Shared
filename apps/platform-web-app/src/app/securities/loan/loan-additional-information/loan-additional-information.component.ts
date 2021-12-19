import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import * as _ from 'lodash';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import { Toastr } from '@pnkl-frontend/core';
import { Loan } from '@pnkl-frontend/shared';
import { LoanService } from '@pnkl-frontend/shared';
import { Utility } from '@pnkl-frontend/shared';
import { AssetAdditionalInformationComponent } from '../../shared/asset-additional-information.component';
import { SecuritiesHelper } from '../../shared/securities-helper.service';

@Component({
  selector: 'loan-additional-information',
  templateUrl: 'loan-additional-information.component.html'
})
export class LoanAdditionalInformationComponent extends AssetAdditionalInformationComponent {
  constructor(
    fb: FormBuilder,
    pinnaklSpinner: PinnaklSpinner,
    toastr: Toastr,
    utility: Utility,
    private readonly loanService: LoanService,
    securitiesHelper: SecuritiesHelper
  ) {
    super(fb, pinnaklSpinner, securitiesHelper, toastr, utility);
  }

  protected getUpdatedAsset(entity: Loan, existingEntity: Loan): Loan {
    const updatedEntity = {} as Loan;
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
    this.form = this.fb.group({ defaultIndicator: [] });
  }

  protected patchFormValue(): void {
    const asset = this.asset as Loan;
    this.form.patchValue({ defaultIndicator: asset.defaultIndicator });
  }

  protected saveAsset(asset: Loan): Promise<Loan> {
    return this.loanService.putLoan(asset);
  }
}
