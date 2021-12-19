import { Injectable } from '@angular/core';

import { WebServiceProvider } from '../../web-service-provider.service';

@Injectable()
export class UserPushNotificationSettingsService {
  private readonly _userPushNotificationSettingsEndpoint = 'entities/user_push_notification_settings';

  constructor(private wsp: WebServiceProvider) {}

  delete(webSettings: string): Promise<void> {
    return this.wsp.deleteHttp({
      endpoint: `${this._userPushNotificationSettingsEndpoint}/${9999}`,
      // payload: { id: 9999, web: webSettings }
    });
  }

  post(webSettings: string): Promise<string> {
    return this.wsp
      .postHttp<{ web: any }>({
        endpoint: this._userPushNotificationSettingsEndpoint, body: { web: webSettings } })
      .then(result => result.web);
  }
}
