import { Injectable, NgModule } from '@angular/core';
import { Resolve, RouterModule, Routes } from '@angular/router';

import { User, UserService } from '@pnkl-frontend/core';
import { SettingsComponent } from './settings.component';

@Injectable()
export class ChangeAuthenticationResolve implements Resolve<User> {
  constructor(private userService: UserService) {}

  resolve(): Promise<User> {
    return this.userService.getFullUserData(this.userService.getUser().id);
  }
}

const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    resolve: {
      resolveData: ChangeAuthenticationResolve
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [ChangeAuthenticationResolve]
})
export class SettingsRoutingModule {}
