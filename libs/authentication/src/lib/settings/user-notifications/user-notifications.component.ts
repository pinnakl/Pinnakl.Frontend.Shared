import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import {
  PinnaklSpinner,
  Toastr,
} from '@pnkl-frontend/core';
import {
  UserPushNotificationTopic,
  UserPushNotificationTopicsService
} from '@pnkl-frontend/push-notifications-config';

interface NotificationReq {
  add: UserPushNotificationTopic[];
  delete: number[];
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'user-notifications',
  templateUrl: './user-notifications.component.html',
  styleUrls: [ './user-notifications.component.scss' ]
})
export class UserNotificationsComponent implements OnInit {
  userNotifications: UserPushNotificationTopic[] = [];
  userNotificationsForm: FormGroup;
  cancelConfirmationVisible = false;
  loginSecurityForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly _userNotificationsService: UserPushNotificationTopicsService,
    private readonly _spinner: PinnaklSpinner,
    private readonly _toastr: Toastr) {
  }

  get isLoading(): boolean {
    return this._spinner.visible;
  }

  ngOnInit(): void {
    this.getUserNotifications().then(() => {
      this._spinner.stop();
      this.resetForm();
    });
  }

  private async getUserNotifications(): Promise<void> {
    this._spinner.spin();
    this.userNotifications = await this._userNotificationsService.get();
  }

  showFormCancelConfirmation(): void {
    this.cancelConfirmationVisible = true;
  }

  cancelReset(): void {
    this.cancelConfirmationVisible = false;
  }

  resetForm(): void {
    this.initLoginSecurityForm();
    this.cancelReset();
  }

  onSubmit(): void {
    const collectionToSave: {
      add: UserPushNotificationTopic[];
      delete: number[];
    } = { add: [], delete: [] };

    this.userNotifications.filter((notificationTopic: UserPushNotificationTopic) => {
      return this.userNotificationsForm.value[notificationTopic.topicName] !== notificationTopic.checked;
    }).forEach((notificationTopic: UserPushNotificationTopic) => {
        if (this.userNotificationsForm.value[notificationTopic.topicName]) {
          collectionToSave.add.push(notificationTopic);
        } else {
          collectionToSave.delete.push(
            notificationTopic.userPushNotificationId
          );
        }
      });

    this.updateNotifications(collectionToSave);
  }

  private initLoginSecurityForm(): void {
    const group: any = {};
    this.userNotifications.forEach(pushNotificationTopic => {
      group[pushNotificationTopic.topicName] = new FormControl(pushNotificationTopic.checked);
    });
    this.userNotificationsForm = this.fb.group(group);
  }

  private updateNotifications(collectionToSave: NotificationReq): void {
    this._spinner.spin();
    this._userNotificationsService
      .saveMany(collectionToSave)
      .then(results => {
        this.userNotifications = this.userNotifications.map((notificationTopic: UserPushNotificationTopic) => {
            const addedTopic = results.add.find((addedNotificationTopic: UserPushNotificationTopic) =>
                addedNotificationTopic.id === notificationTopic.id);
            if (addedTopic) {
              notificationTopic.userPushNotificationId = addedTopic.userPushNotificationId;
              notificationTopic.checked = true;
            } else if (
              results.delete.find(deletedNotificationTopicId =>
                deletedNotificationTopicId === notificationTopic.userPushNotificationId)) {
              notificationTopic.userPushNotificationId = null;
              notificationTopic.checked = false;
            }
            return notificationTopic;
          }
        );
        this._spinner.stop();
        this._toastr.success('Notification subscriptions saved successfully!');
      })
      .catch(error => {
        console.error('Error while delete/update notifications', error);
        this._spinner.stop();
        this._toastr.error('Error in changing');
      });
  }
}
