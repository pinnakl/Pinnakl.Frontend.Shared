import { NgModule } from '@angular/core';

import { SharedModule } from '@pnkl-frontend/shared';
import { UserPushNotificationTopicsService } from './user-push-notification-topics';

@NgModule({
  imports: [SharedModule],
  providers: [UserPushNotificationTopicsService]
})
export class PushNotificationBackendModule {}
