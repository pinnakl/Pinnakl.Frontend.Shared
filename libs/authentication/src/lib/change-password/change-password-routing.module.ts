import { Injectable, NgModule } from '@angular/core';
import { Resolve, RouterModule, Routes } from '@angular/router';

import { User } from '@pnkl-frontend/core';
import { UserService } from '@pnkl-frontend/core';
import { ChangePasswordComponent } from './change-password.component';

@Injectable()
export class ChangePasswordResolve implements Resolve<User> {
  constructor(private userService: UserService) {}

  resolve(): User {
    return this.userService.getUser();
  }
}

const routes: Routes = [
  {
    path: '',
    component: ChangePasswordComponent,
    resolve: {
      resolveData: ChangePasswordResolve
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [ChangePasswordResolve]
})
export class ChangePasswordRoutingModule {}
