import { Injectable, NgModule } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterModule,
  Routes
} from '@angular/router';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { RouteResolverComponent } from '@pnkl-frontend/shared';

import { ApiPlaygroundHomeComponent } from './api-playground/api-playground-home.component';

@Injectable()
export class AccountsResolve implements Resolve<any> {
  constructor(private wsp: WebServiceProvider) {}
  resolve(route: ActivatedRouteSnapshot): any {
    // return this.wsp.get(
    //   '/accounts?fields=AccountCode,AccountNum,Name,IsPrimaryForReturns,OrderOfImportance'
    // );
    return null;
  }
}

const routes: Routes = [
  {
    path: '',
    component: RouteResolverComponent,
    data: {
      title: 'api-playground',
      resolvingPath: 'api-playground/api-playground-resolved'
    }
  },
  {
    path: 'api-playground-resolved',
    component: ApiPlaygroundHomeComponent,
    resolve: {
      accounts: AccountsResolve
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [AccountsResolve]
})
export class ApiPlaygroundRoutingModule {}
