import { Injectable, NgModule } from '@angular/core';
import { Resolve, RouterModule, Routes } from '@angular/router';

import { RouteResolverComponent } from '@pnkl-frontend/shared';
import { SecurityService } from '@pnkl-frontend/shared';
import { SecuritiesHomeResolvedData } from './securities-home-resolved-data.model';
import { SecuritiesHomeComponent } from './securities-home.component';

@Injectable()
export class SecuritiesHomeResolve
  implements Resolve<SecuritiesHomeResolvedData> {

  constructor(private readonly securityService: SecurityService) {}

  async resolve(): Promise<SecuritiesHomeResolvedData> {
    return Promise.all([
      this.securityService.getAssetTypes()
    ]).then(result => {
      const  [assetTypes] = result;
      return new SecuritiesHomeResolvedData(assetTypes);
    });
  }
}

const routes: Routes = [
  {
    path: 'securities-home',
    component: RouteResolverComponent,
    data: {
      title: 'Securities',
      resolvingPath: 'securities/securities-home-resolved'
    }
  },
  {
    path: 'securities-home-resolved',
    component: SecuritiesHomeComponent,
    resolve: {
      resolvedData: SecuritiesHomeResolve
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [SecuritiesHomeResolve]
})
export class SecuritiesHomeRoutingModule {}
