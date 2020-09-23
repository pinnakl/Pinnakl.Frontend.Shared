import { Injectable } from '@angular/core';

import { WebServiceProvider } from '../../web-service-provider.service';

@Injectable()
export class UserPushNotificationSettingsService {
  private readonly RESOURCE_URL = 'user_push_notification_settings';

  constructor(private wsp: WebServiceProvider) {}

  delete(webSettings: string): Promise<void> {
    return this.wsp.delete({
      endPoint: this.RESOURCE_URL,
      payload: { id: 9999, web: webSettings }
    });
  }

  post(webSettings: string): Promise<string> {
    return this.wsp
      .post({ endPoint: this.RESOURCE_URL, payload: { web: webSettings } })
      .then(result => result.web);
  }
}
