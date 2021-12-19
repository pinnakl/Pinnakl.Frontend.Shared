import { ModuleWithProviders, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '@pnkl-frontend/shared';
import { SharedFilterModule } from '@progress/kendo-angular-grid';
import { QrCodeModule } from 'ng-qrcode';

import { CodeInputComponent } from './2fa-code-input/2fa-code-input.component';
import { AuthenticationRoutingModule } from './authentication-routing.module';
import { AuthenticationAuthConfig } from './authentication.model';
import { DEFAULTSCREEN, PRODUCTION, USERTYPE } from './environment.tokens';
import { LoginComponent } from './login';
import { QrCodeComponent } from "./qr-code/qr-code.component";
import { SessionManagementModule } from './session-management';
import { ChangePasswordComponent } from './settings/change-password/change-password.component';

@NgModule({
  declarations: [LoginComponent, ChangePasswordComponent, CodeInputComponent, QrCodeComponent],
  imports: [
    AuthenticationRoutingModule,
    ReactiveFormsModule,
    SessionManagementModule,
    SharedModule,
    SharedFilterModule,
    QrCodeModule
  ],
  exports: [LoginComponent, ChangePasswordComponent, QrCodeComponent]
})
export class AuthenticationModule {
  public static register(authConfig: AuthenticationAuthConfig): ModuleWithProviders<AuthenticationModule> {
    return {
      ngModule: AuthenticationModule,
      providers: [
        { provide: PRODUCTION, useValue: authConfig.production },
        { provide: DEFAULTSCREEN, useValue: authConfig.startupScreen },
        { provide: USERTYPE, useValue: authConfig.userType }
      ]
    };
  }
}
