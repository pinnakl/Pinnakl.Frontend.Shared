import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { UserPushNotificationTopic } from '../../../push-notifiaction-backend';

@Component({
  selector: 'push-notification-topic-manager',
  templateUrl: './push-notification-topic-manager.component.html',
  styleUrls: ['./push-notification-topic-manager.component.scss']
})
export class PushNotificationTopicManagerComponent implements OnChanges {
  @Input() pushNotificationTopics: (UserPushNotificationTopic & {
    checked: boolean;
  })[];
  @Output() onSave = new EventEmitter<{
    add: UserPushNotificationTopic[];
    delete: number[];
  }>();
  form: FormGroup;

  constructor() {}

  ngOnChanges(): void {
    this.createForm();
  }

  createForm(): void {
    let group: any = {};
    this.pushNotificationTopics.forEach(pushNotificationTopic => {
      group[pushNotificationTopic.topicName] = new FormControl(
        pushNotificationTopic.checked
      );
    });
    this.form = new FormGroup(group);
  }

  onSubmit(): void {
    let collectionToSave: {
      add: UserPushNotificationTopic[];
      delete: number[];
    } = { add: [], delete: [] };

    this.pushNotificationTopics
      .filter(
        notificationTopic =>
          this.form.value[notificationTopic.topicName] !==
          notificationTopic.checked
      )
      .forEach(notificationTopic => {
        if (this.form.value[notificationTopic.topicName]) {
          collectionToSave.add.push(notificationTopic);
        } else {
          collectionToSave.delete.push(
            notificationTopic.userPushNotificationId
          );
        }
      });
    this.onSave.emit(collectionToSave);
  }
}
