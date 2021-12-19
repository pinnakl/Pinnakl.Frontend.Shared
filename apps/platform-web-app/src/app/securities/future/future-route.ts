import { Injectable } from '@angular/core';
import { Resolve, Route } from '@angular/router';

import { FutureService } from '@pnkl-frontend/shared';
import { SecuritiesHelper } from '../shared/securities-helper.service';
import { FutureResolvedData } from './future-resolved-data.model';
import { FutureComponent } from './future.component';

@Injectable()
export class FutureResolve implements Resolve<FutureResolvedData> {
  constructor(
    private readonly futureService: FutureService,
    private readonly securitiesHelper: SecuritiesHelper
  ) {}

  resolve(): Promise<FutureResolvedData> {
    const security = this.securitiesHelper.securityDetailsResolvedData.security;
    return security
      ? this.futureService
          .getFutureFromSecurityId(security.id)
          .then(result => new FutureResolvedData(result))
      : null;
  }
}

export const futureRoute: Route = {
  path: 'future',
  component: FutureComponent,
  resolve: {
    resolvedData: FutureResolve
  }
};
