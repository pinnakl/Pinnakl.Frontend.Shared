import { NgModule } from '@angular/core';

import { FirebaseMessagingService } from './firebase-messaging.service';
import { PushNotificationService } from './push-notification.service';
import { UserPushNotificationSettingsService } from './user-push-noification-setting';

@NgModule({
  providers: [
    FirebaseMessagingService,
    PushNotificationService,
    UserPushNotificationSettingsService
  ]
})
export class PushNotificationModule { }
