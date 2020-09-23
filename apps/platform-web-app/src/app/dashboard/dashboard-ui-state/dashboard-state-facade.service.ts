import { Injectable } from '@angular/core';

import { MemoizedSelector, select, Store } from '@ngrx/store';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { RecommendedAction } from '../dashboard-backend';
import { selectAllRecommendedActions } from '../dashboard-backend-state';
import {
  AttemptUpdateRecommendedAction,
  SubscribeToDashboardRecommendedActions,
  UnSubscribeToDashboardRecommendedActions
} from '../dashboard-backend-state/store/recommended-actions';
import { ProcessRecommendedAction } from './recommended-actions-processing';

@Injectable()
export class DashboardStateFacadeService {
  constructor(private _store: Store<any>) {}

  selectRecommendedActions$: Observable<
    RecommendedAction[]
  > = this._selectFromStore(selectAllRecommendedActions).pipe(
    map(actions =>
      actions
        .filter(
          action =>
            !action.actionSupressedAt &&
            action.timeFrameEnd >
              moment()
                .utc()
                .toDate()
        )
        .sort(action => -1 * action.id)
    )
  );

  supressAction(action: RecommendedAction): void {
    this._store.dispatch(
      new AttemptUpdateRecommendedAction({
        recommendedAction: { id: action.id, actionSupressedAt: new Date() }
      })
    );
  }

  subscribeToRecommendedActions(): void {
    this._store.dispatch(new SubscribeToDashboardRecommendedActions());
  }

  unSubscribeToRecommendedActions(): void {
    this._store.dispatch(new UnSubscribeToDashboardRecommendedActions());
  }

  processRecommendedAction(action: RecommendedAction): void {
    this._store.dispatch(new ProcessRecommendedAction(action));
  }

  private _selectFromStore<T>(
    selector: MemoizedSelector<object, T>
  ): Observable<T> {
    return this._store.pipe(select(selector));
  }
}
