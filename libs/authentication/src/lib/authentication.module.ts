import { ModuleWithProviders, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '@pnkl-frontend/shared';
import { AuthenticationRoutingModule } from './authentication-routing.module';
import { PRODUCTION } from './environment.tokens';
import { DEFAULTSCREEN } from './environment.tokens';
import { LoginComponent } from './login/login.component';
import { SessionManagementModule } from './session-management';

@NgModule({
  declarations: [LoginComponent],
  imports: [
    AuthenticationRoutingModule,
    ReactiveFormsModule,
    SessionManagementModule,
    SharedModule
  ],
  exports: [LoginComponent]
})
export class AuthenticationModule {
  public static register( authConfig ): ModuleWithProviders<AuthenticationModule> {
    return {
      ngModule: AuthenticationModule,
      providers: [{ provide: PRODUCTION, useValue: authConfig.production }, { provide: DEFAULTSCREEN, useValue: authConfig.startupScreen}]
    };
  }
}
