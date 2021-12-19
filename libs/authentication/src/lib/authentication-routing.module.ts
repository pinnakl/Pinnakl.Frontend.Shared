import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AlreadyLoggedInGuard, LoginComponent } from './login';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    canActivate: [AlreadyLoggedInGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [AlreadyLoggedInGuard]
})
export class AuthenticationRoutingModule {}
