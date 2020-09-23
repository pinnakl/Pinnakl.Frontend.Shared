import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AlreadyLoggedInGuard } from './login/already-logged-in.guard';
import { LoginComponent } from './login/login.component';

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
