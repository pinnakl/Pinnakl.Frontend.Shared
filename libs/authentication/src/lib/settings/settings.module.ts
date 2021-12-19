import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '@pnkl-frontend/shared';
import { AuthenticationModule } from '../authentication.module';
import { AccessControlComponent } from './access-control/access-control.component';
import { AccountSettingsComponent } from './account-settings/account-settings.component';
import { LoginSecurityComponent } from './login-security/login-security.component';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import { UserNotificationsComponent } from './user-notifications/user-notifications.component';
import { CrmSettingsComponent } from './crm-settings/crm-settings.component';
import { CustomAtttributeComponent } from './custom-attributes-field-list/custom-attributes-field-creator/custom-attributes-field-creator.component';
import { CustomAttributesFieldListComponent } from './custom-attributes-field-list/custom-attributes-field-list.component';

@NgModule({
  declarations: [
    SettingsComponent,
    AccountSettingsComponent,
    LoginSecurityComponent,
    UserNotificationsComponent,
    AccessControlComponent,
    CrmSettingsComponent,
    CustomAttributesFieldListComponent,
    CustomAtttributeComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    SettingsRoutingModule,
    ReactiveFormsModule,
    AuthenticationModule
  ],
  exports: [SettingsComponent]
})
export class SettingsModule {}
