import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PinnaklSpinner, Toastr } from '@pnkl-frontend/core';
import {
  UserPushNotificationTopic,
  UserPushNotificationTopicsService
} from '../../push-notifiaction-backend';
import { Utility } from '@pnkl-frontend/shared';

@Component({
  selector: 'push-notification-home',
  templateUrl: 'push-notification-home.component.html'
})
export class PushNotificationHomeComponent implements OnInit {
  userNotificationTopics: (UserPushNotificationTopic & {
    checked: boolean;
  })[];

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly pnklSpinner: PinnaklSpinner,
    private readonly toaster: Toastr,
    private readonly userPushNotificationSvc: UserPushNotificationTopicsService,
    private readonly utility: Utility
  ) { }

  ngOnInit(): void {
    let { userNotificationTopics } = this.activatedRoute.snapshot.data as {
      userNotificationTopics: UserPushNotificationTopic[];
    };
    this.userNotificationTopics = userNotificationTopics.map(
      notificationTopic => ({
        ...notificationTopic,
        checked: !!notificationTopic.userPushNotificationId
      })
    );
  }

  onSave(collectionToSave: {
    add: UserPushNotificationTopic[];
    delete: number[];
  }): void {
    this.pnklSpinner.spin();
    this.userPushNotificationSvc
      .saveMany(collectionToSave)
      .then(results => {
        this.userNotificationTopics = this.userNotificationTopics.map(
          notificationTopic => {
            let addedTopic = results.add.find(
              addedNotificationTopic =>
                addedNotificationTopic.id === notificationTopic.id
            );
            if (addedTopic) {
              notificationTopic.userPushNotificationId =
                addedTopic.userPushNotificationId;
              notificationTopic.checked = true;
            } else if (
              results.delete.find(
                deletedNotificationTopicId =>
                  deletedNotificationTopicId ===
                  notificationTopic.userPushNotificationId
              )
            ) {
              notificationTopic.userPushNotificationId = null;
              notificationTopic.checked = false;
            }
            return notificationTopic;
          }
        );
        this.pnklSpinner.stop();
        this.toaster.success('Notification subscriptions saved successfully!');
      })
      .catch(this.utility.errorHandler.bind(this));
  }
}
