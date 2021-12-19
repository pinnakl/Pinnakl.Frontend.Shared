import {Observable, Subject} from 'rxjs';
import {skip, take} from 'rxjs/operators';

export class PageSubscriptionsHandler {
  pageSubscriptionsEstablishedSub: Subject<boolean>;
  pageSubscriptionsErroredSub: Subject<boolean>;

  startStreamsEstablishingHandling(requiredReadyStreamsCount: number): {
    established: Observable<boolean>,
    errored: Observable<boolean>
  } {
    this.pageSubscriptionsEstablishedSub = new Subject<boolean>();
    this.pageSubscriptionsErroredSub = new Subject<boolean>();

    if (requiredReadyStreamsCount === 0) {
      setTimeout(() => this.pageSubscriptionsEstablishedSub.next(true), 0);
      this.pageSubscriptionsErroredSub = undefined;
      return {
        established: this.pageSubscriptionsEstablishedSub,
        errored: new Subject()
      };
    }

    return {
      established: this.pageSubscriptionsEstablishedSub.pipe(skip(requiredReadyStreamsCount - 1), take(1)),
      errored: this.pageSubscriptionsErroredSub
    };
  }
}
