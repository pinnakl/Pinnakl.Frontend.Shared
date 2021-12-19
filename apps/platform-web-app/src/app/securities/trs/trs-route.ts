import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Route } from '@angular/router';
import { SecurityService } from '@pnkl-frontend/shared';
import { SecuritiesHelper } from '../shared/securities-helper.service';
import { TRSService } from './trs-backend';
import { TRSComponent } from './trs.component';

@Injectable()
export class TrsResolve implements Resolve<any> {
  constructor(
    private readonly trsService: TRSService,
    private readonly securityService: SecurityService,
    private readonly securitiesHelper: SecuritiesHelper
  ) { }

  async resolve(route: ActivatedRouteSnapshot): Promise<any> {
    const security = this.securitiesHelper.securityDetailsResolvedData.security;
    return Promise.all([
      this.securityService.getAllSecurities(),
      security ? this.trsService.getTRSFromSecId(security.id) : null
    ]).then(([securities, trs]) => {
      if (Array.isArray(trs) && trs.length > 0) {
        return { trs: trs[0], securities };
      }
      return { trs: {}, securities };
    });
  }
}

export const trsRoute: Route = {
  path: 'trs',
  component: TRSComponent,
  resolve: {
    resolvedData: TrsResolve
  }
};
