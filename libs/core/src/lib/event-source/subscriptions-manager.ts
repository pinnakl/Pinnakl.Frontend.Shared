import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { EventSourceService } from './event-source.service';

@Injectable()
export class SubscriptionsManager {
  private readonly _subscriptionsMap = new Map<string, Subject<any>>();
  private readonly _subscriptionsCountMap = new Map<string, number>();

  private readonly SUBSCRIBE_URL_ENDPOINT = 'Subscribe';
  private readonly UNSUBSCRIBE_URL_ENDPOINT = 'Unsubscribe';

  constructor(private readonly _eventSourceService: EventSourceService) {}

  registerSubscription<T>(
    baseUrl: string,
    urlDetails: string
  ): Observable<T> {
    const url = this.getFullUrl(baseUrl, urlDetails);

    const subscription = this._subscriptionsMap.get(url);

    // Get already existed subscription
    if (subscription) {
      this._subscriptionsCountMap.set(url, this._subscriptionsCountMap.get(url) + 1);
      return subscription.asObservable();
    }

    // Create new subscription
    const subj = this._eventSourceService.create<T>(url);
    this._subscriptionsMap.set(url, subj);
    this._subscriptionsCountMap.set(url, 1);
    // Handle clearing subscription if there is an error in event source
    subj.pipe(finalize(this.clearSubscription.bind(this, url))).subscribe();

    return subj.asObservable();
  }

  unRegisterSubscription(
    baseUrl: string,
    urlDetails: string
  ): void {
    const urlForMap = this.getFullUrl(baseUrl, urlDetails);
    const subscriptionsCount = this._subscriptionsCountMap.get(urlForMap);

    if (subscriptionsCount > 1) {
      this._subscriptionsCountMap.set(urlForMap, this._subscriptionsCountMap.get(urlForMap) - 1);
    } else if (subscriptionsCount === 1) {
      this.clearSubscription(urlForMap);
    }
  }

  private clearSubscription(url: string): void {
    this._eventSourceService.stopEventSource(url);
    this._subscriptionsMap.get(url).complete();
    this._subscriptionsMap.delete(url);
    this._subscriptionsCountMap.delete(url);
  }

  private getFullUrl(baseUrl: string, urlDetails: string): string {
    return `${baseUrl}${this.SUBSCRIBE_URL_ENDPOINT}${urlDetails}`;
  }
}
