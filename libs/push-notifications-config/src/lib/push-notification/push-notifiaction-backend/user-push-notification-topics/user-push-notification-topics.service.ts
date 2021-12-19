import { Injectable } from '@angular/core';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { UserNotificationTopicFromApi } from './user-push-notification-topic-from-api.model';
import { UserPushNotificationTopic } from './user-push-notification-topic.model';

@Injectable()
export class UserPushNotificationTopicsService {
  private readonly userPushNotificationTopicsEndpoint = 'entities/user_push_notification_topics';

  constructor(private readonly wsp: WebServiceProvider) {}

  async get(): Promise<UserPushNotificationTopic[]> {
    const result = await this.wsp.getHttp<UserNotificationTopicFromApi[]>({
      endpoint: this.userPushNotificationTopicsEndpoint
    });

    return result.map(this.formatUserPushNotificationTopic);
  }

  async delete(id: number): Promise<void> {
    return this.wsp.deleteHttp({
      endpoint: `${this.userPushNotificationTopicsEndpoint}/${id}`
    });
  }

  async post(
    entityToSave: UserPushNotificationTopic
  ): Promise<UserPushNotificationTopic> {
    const result = await this.wsp.postHttp<any>({
      endpoint: this.userPushNotificationTopicsEndpoint,
      body: { pushnotificationtopicid: entityToSave.id.toString() }
    });

    return { ...result, userPushNotificationId: +result.id };
  }

  saveMany(x: {
    add: UserPushNotificationTopic[];
    delete: number[];
  }): Promise<{
    add: UserPushNotificationTopic[];
    delete: number[];
  }> {
    const deletePromises = x.delete.map(this.delete.bind(this));
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
        : null,
      checked: !!entityFromApi.userpushnotificationid,
    };
  }
}
