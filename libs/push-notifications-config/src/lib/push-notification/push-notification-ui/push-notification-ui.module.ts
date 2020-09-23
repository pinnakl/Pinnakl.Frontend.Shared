import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PushNotificationBackendModule } from '../push-notifiaction-backend';
import { SharedModule } from '@pnkl-frontend/shared';
import { PushNotificationHomeComponent } from './push-notification-home';
import { PushNotificationTopicManagerComponent } from './push-notification-home';
import { PushNotificationUiRoutingModule } from './push-notification-ui-routing.module';

@NgModule({
  declarations: [
    PushNotificationHomeComponent,
    PushNotificationTopicManagerComponent
  ],
  imports: [
    CommonModule,
    PushNotificationUiRoutingModule,
    PushNotificationBackendModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class PushNotificationUiModule {}
