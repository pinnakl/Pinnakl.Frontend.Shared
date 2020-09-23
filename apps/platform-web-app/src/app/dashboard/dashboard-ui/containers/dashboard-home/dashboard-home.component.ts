import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as fromBackendModel from '../../../dashboard-backend';
import * as fromStore from '../../../dashboard-backend-state/store';

import { Observable, of, Subscription } from 'rxjs';

import * as _ from 'lodash';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { OnDemandPreloadService } from '@pnkl-frontend/core';
import {
  DashboardMarketMacroStat,
  RecommendedAction
} from '../../../../dashboard/dashboard-backend';
import * as fromAction from '../../../dashboard-backend-state/store/dashboard/dashboard-backend.actions';
import {
  AddRecommendedAction,
  UpdateRecommendedAction
} from '../../../dashboard-backend-state/store/recommended-actions';
import { DashboardService } from '../../../dashboard-backend/dashboard';
import { DashboardStateFacadeService } from '../../../dashboard-ui-state/dashboard-state-facade.service';
import { ClientConnectivity } from '@pnkl-frontend/shared';
import { TaskObject } from '../../../shared/task-object.model';

@Component({
  selector: 'dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class DashboardHomeComponent implements OnInit, OnDestroy {
  pnlSummary$: Observable<fromBackendModel.PnlModel>;
  actions$: Observable<string[]>;
  alerts$: Observable<fromBackendModel.AlertModel[]>;
  activitySummary$: Observable<{
    pnlAssetType: fromBackendModel.PnlExposure[];
    pnlSector: fromBackendModel.PnlExposure[];
    positionsAdded: fromBackendModel.PositionEventModel[];
    positionsExited: fromBackendModel.PositionEventModel[];
  }>;
  recommendedActions$: Observable<RecommendedAction[]>;
  alertSubscription: Subscription;
  TasksStatusSubscription: Subscription;
  entities: ClientConnectivity[];
  macroStats$: Observable<DashboardMarketMacroStat[]>;
  private subscription: Subscription;
  selectedTask: TaskObject;
  tasks: TaskObject[];
  tasksVisible = false;
  taskHistoryVisible = false;
  constructor(
    private store: Store<fromStore.State>,
    private dashboardService: DashboardService,
    private activatedRoute: ActivatedRoute,
    private dashboardStateFacadeService: DashboardStateFacadeService,
    private onDemandPreloadStrategy: OnDemandPreloadService,
    private wsp: WebServiceProvider
  ) {}

  ngOnInit(): void {
    this.pnlSummary$ = this.store.pipe(select(fromStore.selectDashboardPnl));
    this.actions$ = this.store.pipe(select(fromStore.selectDashboardActions));
    this.alerts$ = this.store.pipe(select(fromStore.selectDashboardAlerts));
    this.activitySummary$ = this.store.pipe(
      select(fromStore.selectDashboardActivitySummary)
    );
    this.recommendedActions$ = this.dashboardStateFacadeService.selectRecommendedActions$;
    this.macroStats$ = this.store.pipe(
      select(fromStore.selectAllDashboardMarketMacroStats)
    );
    this.store.dispatch(new fromStore.SubscribeToDashboardMarketMacroStats());
    let [
      notificationObservable,
      taskStatusDetailObservable,
      recommendedActionsObservable
    ] = this.dashboardService.subscribeToNotificationsAndTaskStatusDetailsAndRecommendedActions();

    let notificationSubscription = notificationObservable.subscribe(
        ({ action, body: alert }) => {
          this.store.dispatch(new fromAction.AddDashboardAlert(alert));
        }
      ),
      taskStatusDetailSubscription = taskStatusDetailObservable.subscribe(
        ({ action, body: taskStatusDetail }) => {
          this.tasks = this.tasks.map((task: TaskObject) => {
            if (task.id === taskStatusDetail.taskId) {
              task.lastRunDetails = taskStatusDetail.lastRunDetails;
              task.result = taskStatusDetail.result;
            }
            return task;
          });
        }
      ),
      recommendedActionsSubscription = recommendedActionsObservable.subscribe(
        ({ action, body }) => {
          if (action === 'POST') {
            this.store.dispatch(
              new AddRecommendedAction({ recommendedAction: body })
            );
          }
          if (action === 'PUT') {
            this.store.dispatch(
              new UpdateRecommendedAction({
                recommendedAction: {
                  id: body.id,
                  changes: body
                }
              })
            );
          }
        }
      );
    notificationSubscription
      .add(taskStatusDetailSubscription)
      .add(recommendedActionsSubscription);
    this.subscription = notificationSubscription;
    Object.assign(this, this.activatedRoute.snapshot.data.resolvedData);
    this.onDemandPreloadStrategy.preloadAllModules();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.store.dispatch(
      new fromStore.UnsubscribeFromDashboardMarketMacroStats()
    );
    this.dashboardStateFacadeService.unSubscribeToRecommendedActions();
  }

  loadActivitySummary(date: { startDate: Date; endDate: Date }): void {
    this.store.dispatch(new fromAction.AttemptLoadActivitySummary(date));
  }

  openTasks(): void {
    this.tasksVisible = !this.tasksVisible;
  }

  loadTaskHistory(): void {
    this.taskHistoryVisible = true;
    this.tasksVisible = false;
  }

  loadTaskDetails(): void {
    this.taskHistoryVisible = false;
    this.tasksVisible = true;
  }

  removeAlert(id: number): void {
    this.store.dispatch(new fromAction.RemoveDashboardAlert({ id }));
  }

  setSelectedTask(selectedTask: TaskObject): void {
    this.selectedTask = selectedTask;
  }
}
