import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Option } from '@pnkl-frontend/shared';
import { SecurityAttributeOption } from '@pnkl-frontend/shared';
import { AssetComponent } from '../shared/asset.component';
import { SecuritiesHelper } from '../shared/securities-helper.service';

@Component({
  templateUrl: 'option.component.html'
})
export class OptionComponent extends AssetComponent {
  option: Option;
  optionTypeOptions: SecurityAttributeOption[];
  putCallIndicatorOptions: SecurityAttributeOption[];
  constructor(
    activatedRoute: ActivatedRoute,
    securitiesHelper: SecuritiesHelper
  ) {
    super(activatedRoute, securitiesHelper);
  }
}
