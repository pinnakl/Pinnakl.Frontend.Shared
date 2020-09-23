import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { WindowModule } from '@progress/kendo-angular-dialog';

import { ClientJsSessionInformationProvider } from './client-js-session-information-provider.service';
import { IpdataSessionInformationProvider } from './ipdata-session-information-provider.service';
import { SessionManagementService } from './session-management.service';
import { SessionManagerComponent } from './session-manager';

@NgModule({
  imports: [CommonModule, WindowModule],
  providers: [
    ClientJsSessionInformationProvider,
    IpdataSessionInformationProvider,
    SessionManagementService
  ],
  declarations: [SessionManagerComponent],
  exports: [SessionManagerComponent]
})
export class SessionManagementModule {}
