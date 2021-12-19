import { Injectable } from '@angular/core';
import { Resolve, Route } from '@angular/router';

import { OptionService } from '@pnkl-frontend/shared';
import { SecurityService } from '@pnkl-frontend/shared';
import { SecuritiesHelper } from '../shared/securities-helper.service';
import { OptionResolvedData } from './option-resolved-data.model';
import { OptionComponent } from './option.component';

@Injectable()
export class OptionResolve implements Resolve<OptionResolvedData> {
  constructor(
    private readonly optionService: OptionService,
    private readonly securitiesHelper: SecuritiesHelper,
    private readonly securityService: SecurityService
  ) { }

  async resolve(): Promise<OptionResolvedData> {
    const OPTION_TYPE =
        '/security_master/payload/instrument/derivatives/options/contract/exercise_style',
      security = this.securitiesHelper.securityDetailsResolvedData.security;
    return Promise.all([
      security ? this.optionService.getOptionFromSecurityId(security.id) : null,
      this.securityService.getSecurityAttributeOptions(OPTION_TYPE, true),
      this.securityService.getSecurityAttributeOptions(
        'put_call_indicator',
        true
      )
    ]).then(result => {
      const [option, optionTypeOptions, putCallIndicatorOptions] = result;
      return new OptionResolvedData(
        option,
        optionTypeOptions,
        putCallIndicatorOptions
      );
    });
  }
}

export const optionRoute: Route = {
  path: 'option',
  component: OptionComponent,
  resolve: {
    resolvedData: OptionResolve
  }
};
