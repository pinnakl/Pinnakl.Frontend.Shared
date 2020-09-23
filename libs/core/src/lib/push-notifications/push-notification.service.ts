import { Injectable } from '@angular/core';

import { FirebaseMessagingService } from './firebase-messaging.service';
import { UserPushNotificationSettingsService } from './user-push-noification-setting';

@Injectable()
export class PushNotificationService {
  private readonly WEB_PUSH_NOTIFICATION_SETTINGS =
    'web_push_notification_setting';

  constructor(
    private firebaseService: FirebaseMessagingService,
    private userPushNotificationService: UserPushNotificationSettingsService
  ) {}

  async loadWebNotificationSettings(): Promise<void> {
    let storedWebNotificationSettings = localStorage.getItem(
        this.WEB_PUSH_NOTIFICATION_SETTINGS
      ),
      newWebSettings: string;
    try {
      newWebSettings = await this.firebaseService.getFCMWebSetting();
    } catch (error) {
      if (
        error.code === 'messaging/notifications-blocked' &&
        storedWebNotificationSettings
      ) {
        this.userPushNotificationService
          .delete(storedWebNotificationSettings)
          .then(result =>
            localStorage.removeItem(this.WEB_PUSH_NOTIFICATION_SETTINGS)
          );
        return;
      }
      throw error;
    }

    if (storedWebNotificationSettings === newWebSettings) {
      return;
    }

    newWebSettings = await this.userPushNotificationService.post(
      newWebSettings
    );

    localStorage.setItem(this.WEB_PUSH_NOTIFICATION_SETTINGS, newWebSettings);
  }
}
