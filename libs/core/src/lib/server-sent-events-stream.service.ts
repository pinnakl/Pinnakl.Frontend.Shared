import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { SubscriptionsManager } from './event-source';
import { UserService } from './user.service';

export enum EventMessageType {
  CRM_INCLUDED_CONTACT = 6,
  CRM_TRACKING_LINK_CONTACT = 7,
  OBJECTSTORE_ACTIONS = 11,
}

export enum EventActionType {
  ALL = 'all',
  GET = 'get',
  PUT = 'put',
  POST = 'post',
  DELETE = 'delete',
}

export enum EventEndpoint {
  NOTIFICATIONS = 'notifications',
  TASKS_STATUS = 'tasks_status',
  TRADE_REQUESTS = 'trade_requests',
  TRADE_ALLOCATION_OMS = 'trade_allocation_oms',
}

interface StreamResult {
  MessageType: EventMessageType;
  Message: {
    ActionType: EventActionType;
    Endpoint: string;
    ClientId: number;
    Payload: Record<string, any>;
  };
}

@Injectable()
export class ServerSentEventsStreamService {
  constructor(
    private readonly _subscriptionsManager: SubscriptionsManager,
    private readonly _userService: UserService
  ) { }

  private RESOURCE_URL = (baseUrl: string, endpoint: string) => `${baseUrl}${endpoint}/`;

  subscribeToServerSentEvents<T>(baseUrl: string, topics: string[] = [], endpoint: string = 'Core'): Observable<T> {
    return this._subscriptionsManager.registerSubscription<T>(
      `${this.RESOURCE_URL(baseUrl, endpoint)}`,
      `?usertoken=${
        this._userService.getUser()?.token
      }${(Array.isArray(topics) && topics.length) ? `&topic=${topics.join(',')}` : ''}`
    );
  }

  // We need to unsubscribe in that places where we are dispatching events from stream data
  unsubscribeToServerSentEvents(baseUrl: string, topics: string[] = [], endpoint: string = 'Core'): void {
    return this._subscriptionsManager.unRegisterSubscription(
      `${this.RESOURCE_URL(baseUrl, endpoint)}`,
      `?usertoken=${
        this._userService.getUser()?.token
      }${(Array.isArray(topics) && topics.length) ? `&topic=${topics.join(',')}` : ''}`
    );
  }

  /**
   * Function to subscribe to event stream (server sent events)
   * @param baseUrl Url for stream (usually is taken from env file)
   * @param endpoint Url part after server url
   * @param endpoints Array of endpoints which should be accepted and passed through
   * @param actions Array of action types which should be accepted and passed through
   */
  subToManyObjectStoreActions(
    baseUrl: string,
    endpoints?: string[],
    actions: string[] = [EventActionType.ALL],
    endpoint: string = 'Core',
  ): Observable<any> {
    const user = this._userService.getUser();
    return this._subscriptionsManager.registerSubscription<StreamResult>(
      `${this.RESOURCE_URL(baseUrl, endpoint)}`,
      `?usertoken=${
        user?.token
      }&topic=OBJECTSTORE_ACTIONS`
    ).pipe(
      filter(item => item.Message.ClientId === user.clientId),
      filter(item => item.MessageType === EventMessageType.OBJECTSTORE_ACTIONS),
      filter(item => (actions && actions[0] !== EventActionType.ALL) ? actions.includes(item.Message.ActionType) : true),
      filter(item => endpoints ? endpoints.includes(item.Message.Endpoint) : true),
      map(({ Message }) => Message),
    );
  }

  // We need to unsubscribe in that places where we are dispatching events from stream data
  unsubToManyObjectStoreActions(
    baseUrl: string,
    endpoint: string = 'Core',
  ): void {
    return this._subscriptionsManager.unRegisterSubscription(
      `${this.RESOURCE_URL(baseUrl, endpoint)}`,
      `?usertoken=${
        this._userService.getUser()?.token
      }&topic=OBJECTSTORE_ACTIONS`
    );
  }
}
