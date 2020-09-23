import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

@Injectable()
export class EventSourceService {
  create = createEventSourceObservable;
}

function createEventSourceObservable<T>({
  eventType,
  url
}: {
  eventType: string;
  url: string;
}): Observable<T> {
  return Observable.create(observer => {
    let eventSource: EventSource;
    createEventSource<T>({
      eventType,
      url,
      onConnect: connectedEventSource => {
        eventSource = connectedEventSource;
      },
      onMessage: (data: T) => {
        observer.next(data);
      }
    });
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  });
}

function createEventSource<T>({
  eventType,
  url,
  onConnect,
  onMessage
}: {
  eventType: string;
  url: string;
  onConnect: (source: EventSource) => void;
  onMessage: (data: T) => void;
}): void {
  const source = new EventSource(url);
  onConnect(source);
  source.addEventListener(eventType, (event: MessageEvent) => {
    const data: T = JSON.parse(event.data);
    onMessage(data);
  });
  source.onerror = () => {
    console.error(new Date().toTimeString());
    source.close();
    setTimeout(() => {
      createEventSource({ url, eventType, onConnect, onMessage });
    }, 4000);
  };
}
