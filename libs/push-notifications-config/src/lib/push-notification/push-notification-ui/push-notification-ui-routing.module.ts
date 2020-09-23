import { Injectable, NgModule } from '@angular/core';
import { Resolve, RouterModule, Routes } from '@angular/router';

import { RouteResolverComponent } from '@pnkl-frontend/shared';
import {
  UserPushNotificationTopic,
  UserPushNotificationTopicsService
} from '../push-notifiaction-backend';
import { PushNotificationHomeComponent } from './push-notification-home/push-notification-home.component';

@Injectable()
export class PushNotificationHomeResolve
  implements Resolve<UserPushNotificationTopic[]> {
  constructor(
    private userPushNotificatioTopicService: UserPushNotificationTopicsService
  ) {}
  resolve(): Promise<UserPushNotificationTopic[]> {
    return this.userPushNotificatioTopicService.get();
  }
}

const routes: Routes = [
  {
    path: 'push-notification-home',
    component: RouteResolverComponent,
    data: {
      title: 'Push Notifications',
      resolvingPath: 'push-notification/push-notification-home-resolved'
    }
  },
  {
    path: 'push-notification-home-resolved',
    component: PushNotificationHomeComponent,
    resolve: {
      userNotificationTopics: PushNotificationHomeResolve
    }
  },
  {
    path: '',
    redirectTo: 'push-notification-home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [PushNotificationHomeResolve]
})
export class PushNotificationUiRoutingModule {}
