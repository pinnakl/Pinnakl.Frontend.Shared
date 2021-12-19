import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Observable, Subject, Subscriber } from 'rxjs';
import { UserService } from '../user.service';
import { PageSubscriptionsHandler } from './page-subscriptions-handler';

@Injectable()
export class EventSourceService {
  private readonly _errorsMap = {};
  private readonly _eventSourcesMap = new Map<string, EventSource>();
  private readonly EVENT_TYPE = 'message';

  constructor(
    private readonly _router: Router,
    private readonly _userService: UserService,
    private readonly _pageSubscriptionsHandler: PageSubscriptionsHandler
  ) { }

  create<T>(url: string): Subject<T> {
    const pageSubscriptionsEstablishedSub = this._pageSubscriptionsHandler
      ?.pageSubscriptionsEstablishedSub;
    const pageSubscriptionsErroredSub = this._pageSubscriptionsHandler
      ?.pageSubscriptionsErroredSub;
    const eventSubject = new Subject<T>();
    new Observable<T>(observer => {
      this.initializeErrorCounter(url);
      this.establishSubscription<T>(
        url,
        ev => {
          pageSubscriptionsEstablishedSub?.next(true);
          this._eventSourcesMap.set(url, ev);
          this._errorsMap[url] = 0;
        },
        observer,
        pageSubscriptionsErroredSub
      );
      return this.stopEventSource.bind(this, url);
    }).subscribe(eventSubject);

    return eventSubject;
  }

  stopEventSource(url: string): void {
    const ev = this._eventSourcesMap.get(url);
    if (ev) {
      ev.close();
      this._eventSourcesMap.delete(url);
    }
  }

  private establishSubscription<T>(
    url: string,
    onEstablish: (ev: EventSource) => void,
    observer: Subscriber<T>,
    errorSub: Subject<boolean>
  ): void {
    let eventSource = new EventSource(url);

    eventSource.addEventListener(this.EVENT_TYPE, (event: MessageEvent) => {
      try {
        const data: T = JSON.parse(event.data);
        observer.next(data);
      } catch (e) {
        console.log('Something went wrong with parsing data', event);
      }
    });

    eventSource.onopen = () => onEstablish(eventSource);

    eventSource.onerror = err => {
      eventSource.close();
      eventSource = null;
      this.onEventSourceError<T>(err, url, onEstablish, observer, errorSub);
    };
  }

  private initializeErrorCounter(url: string): void {
    this._errorsMap[url] = 0;
  }

  private onEventSourceError<T>(
    err: any,
    url: string,
    onEstablish: (ev: EventSource) => void,
    observer: Subscriber<T>,
    errorSub: Subject<boolean>
  ): void {
    // https://stackoverflow.com/questions/59823336/how-to-get-status-code-when-using-eventsource-in-chrome
    // There is no way to get the error code to handle 401
    // So that we need to double check token in local storage on each connection error
    if (!this._userService.getUser()?.token) {
      const name = localStorage.getItem('name');
      localStorage.clear();
      localStorage.setItem('name', name);
      this._router.navigate(['/login']);
    } else {
      this._errorsMap[url] += 1;
      console.error(`Subscription to ${url} can't be established`, err);
      console.error(`Error count: ${this._errorsMap[url]}`);

      if (this._errorsMap[url] < 100) {
        setTimeout(() => {
          this.establishSubscription(url, onEstablish, observer, errorSub);
        }, 4000);
      } else {
        errorSub?.next(true);
        console.error(`Subscription ${url} can't be established`);
        observer.error(`Subscription ${url} can't be established`);
      }
    }
  }
}
