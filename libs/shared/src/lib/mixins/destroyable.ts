/* tslint:disable */
/* eslint-disable */

import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

class Empty {
}

type Constructor<T = {}> = new (...args: Array<any>) => T;

// To use multiple classes
export function DestroyableMixin<TBase extends Constructor>(Base: TBase) {
  @Component({
    template: ''
  })
  abstract class MixedUnsubscribable extends Base implements OnDestroy {
    unsubscribe$ = new Subject<void>();

    ngOnDestroy(): void {
      this.unsubscribe$.next();
      this.unsubscribe$.complete();
    }
  }

  return MixedUnsubscribable;
}

// To use only single class
export const Destroyable = DestroyableMixin(Empty);
