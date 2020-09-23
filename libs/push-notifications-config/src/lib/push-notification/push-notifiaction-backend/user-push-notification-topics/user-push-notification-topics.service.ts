import { Injectable } from '@angular/core';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { UserNotificationTopicFromApi } from './user-push-notification-topic-from-api.model';
import { UserPushNotificationTopic } from './user-push-notification-topic.model';

@Injectable()
export class UserPushNotificationTopicsService {
  private readonly RESOURCE_URL = 'user_push_notification_topics';
  constructor(private wsp: WebServiceProvider) {}

  get(): Promise<UserPushNotificationTopic[]> {
    return this.wsp
      .get({ endPoint: this.RESOURCE_URL })
      .then(results => results.map(this.formatUserPushNotificationTopic));
  }

  delete(id: number): Promise<void> {
    return this.wsp.delete({ endPoint: this.RESOURCE_URL, payload: { id } });
  }

  post(
    entityToSave: UserPushNotificationTopic
  ): Promise<UserPushNotificationTopic> {
    return this.wsp
      .post({
        endPoint: this.RESOURCE_URL,
        payload: { pushnotificationtopicid: entityToSave.id.toString() }
      })
      .then(result => {
        entityToSave.userPushNotificationId = parseInt(result.id);
        return entityToSave;
      });
  }

  saveMany(x: {
    add: UserPushNotificationTopic[];
    delete: number[];
  }): Promise<{
    add: UserPushNotificationTopic[];
    delete: number[];
  }> {
    let deletePromises = x.delete.map(this.delete.bind(this));
    return Promise.all(deletePromises)
      .then(() => {
        return Promise.all(x.add.map(entity => this.post(entity)));
      })
      .then(results => {
        return { add: results, delete: x.delete };
      });
  }

  private formatUserPushNotificationTopic(
    entityFromApi: UserNotificationTopicFromApi
  ): UserPushNotificationTopic {
    return {
      id: parseInt(entityFromApi.id),
      topicDescription: entityFromApi.topicdescription,
      topicName: entityFromApi.topicname,
      userPushNotificationId: !isNaN(
        parseInt(entityFromApi.userpushnotificationid)
      )
        ? parseInt(entityFromApi.userpushnotificationid)
        : null
    };
  }
}
