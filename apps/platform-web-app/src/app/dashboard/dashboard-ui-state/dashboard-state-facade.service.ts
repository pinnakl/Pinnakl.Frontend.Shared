import { Injectable } from '@angular/core';

import { MemoizedSelector, select, Store } from '@ngrx/store';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { selectAllRecommendedActions } from '../dashboard-backend-state/store';
import {
  AttemptUpdateRecommendedAction,
  SubscribeToDashboardRecommendedActions,
  UnSubscribeToDashboardRecommendedActions
} from '../dashboard-backend-state/store/recommended-actions';
import { RecommendedAction } from '../dashboard-backend/recommended-actions/recommended-action.model';
import { ProcessRecommendedAction } from './recommended-actions-processing';

@Injectable()
export class DashboardStateFacadeService {
  constructor(private readonly _store: Store<any>) {}

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
      AttemptUpdateRecommendedAction({
        recommendedAction: { id: action.id, actionSupressedAt: new Date() }
      })
    );
  }

  subscribeToRecommendedActions(): void {
    this._store.dispatch(SubscribeToDashboardRecommendedActions());
  }

  unSubscribeToRecommendedActions(): void {
    this._store.dispatch(UnSubscribeToDashboardRecommendedActions());
  }

  processRecommendedAction(action: RecommendedAction): void {
    this._store.dispatch(ProcessRecommendedAction({ payload: action }));
  }

  private _selectFromStore<T>(
    selector: MemoizedSelector<any, T>
  ): Observable<T> {
    return this._store.pipe(select(selector));
  }
}
