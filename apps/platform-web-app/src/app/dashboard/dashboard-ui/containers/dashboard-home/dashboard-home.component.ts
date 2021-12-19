import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { OnDemandPreloadService, UserService } from '@pnkl-frontend/core';
import { ClientConnectivity } from '@pnkl-frontend/shared';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import * as fromStore from '../../../dashboard-backend-state/store';
import {
  SubscribeToDashboardMarketMacroStats,
  UnsubscribeFromDashboardMarketMacroStats
} from '../../../dashboard-backend-state/store/dashboard-market-macro-stat/dashboard-market-macro-stat.actions';
import * as fromAction from '../../../dashboard-backend-state/store/dashboard/dashboard-backend.actions';
import { DashboardMarketMacroStat } from '../../../dashboard-backend/dashboard-market-macro-stat/dashboard-market-macro-stat.model';
import { AlertModel } from '../../../dashboard-backend/dashboard/alert.model';
import { DashboardService } from '../../../dashboard-backend/dashboard/dashboard.service';
import { PnlExposure } from '../../../dashboard-backend/dashboard/pnl-exposure.model';
import { PnlModel } from '../../../dashboard-backend/dashboard/pnl.model';
import { PositionEventModel } from '../../../dashboard-backend/dashboard/position-event.model';
import { RecommendedAction } from '../../../dashboard-backend/recommended-actions/recommended-action.model';
import { DashboardStateFacadeService } from '../../../dashboard-ui-state';
import { TaskObject } from '../../../shared/task-object.model';

@Component({
  selector: 'dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class DashboardHomeComponent implements OnInit, OnDestroy {
  pnlSummary$: Observable<PnlModel>;
  actions$: Observable<string[]>;
  alerts$: Observable<AlertModel[]>;
  activitySummary$: Observable<{
    pnlAssetType: PnlExposure[];
    pnlSector: PnlExposure[];
    positionsAdded: PositionEventModel[];
    positionsExited: PositionEventModel[];
  }>;
  recommendedActions$: Observable<RecommendedAction[]>;
  entities$: Observable<ClientConnectivity[]>;
  tasks: TaskObject[];
  entities: ClientConnectivity[];
  macroStats$: Observable<DashboardMarketMacroStat[]>;
  selectedTask: TaskObject;
  tasks$: Observable<TaskObject[]>;
  tasksVisible = false;
  taskHistoryVisible = false;
  private notifier = new Subject();
  constructor(
    private store: Store<fromStore.State>,
    private dashboardService: DashboardService,
    private activatedRoute: ActivatedRoute,
    private dashboardStateFacadeService: DashboardStateFacadeService,
    private onDemandPreloadStrategy: OnDemandPreloadService,
    private userService: UserService
  ) { }

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
    this.tasks$ = this.store
      .pipe(select(fromStore.selectDashboardFulfilledTasks))
      .pipe(map(i => JSON.parse(JSON.stringify(i))));
    this.entities$ = this.store
      .pipe(select(fromStore.selectDashboardClientConnectivity))
      .pipe(map(i => JSON.parse(JSON.stringify(i))));
    this.store.dispatch(SubscribeToDashboardMarketMacroStats());
    const [notificationsObservable, taskStatusesObservable] = this.dashboardService
      .subscribeToNotifications();

    notificationsObservable.pipe(takeUntil(this.notifier)).subscribe(
      alert => this.store.dispatch(fromAction.AddDashboardAlert({ payload: alert }))
    );
    taskStatusesObservable.pipe(takeUntil(this.notifier)).subscribe(taskStatusDetail => {
      this.tasks$ = this.tasks$.pipe(
        map((tasks: TaskObject[]) => tasks.map((task: TaskObject) => {
          if (task.id === taskStatusDetail.taskId) {
            task.result = taskStatusDetail.result;
            task.lastRunDetails = taskStatusDetail.lastRunDetails;
          }
          return task;
        }))
      );
    });

    Object.assign(this, this.activatedRoute.snapshot.data.resolvedData);
    this.onDemandPreloadStrategy.preloadAllModules();

    this.userService.validateUserResetPasswordModal();
  }

  ngOnDestroy(): void {
    this.notifier.next();
    this.notifier.complete();
    this.store.dispatch(UnsubscribeFromDashboardMarketMacroStats());
    this.dashboardService.unsubscribeFromNotifications();
    this.dashboardStateFacadeService.unSubscribeToRecommendedActions();
  }

  loadActivitySummary(date: { startDate: Date; endDate: Date }): void {
    this.store.dispatch(fromAction.AttemptLoadActivitySummary(date));
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
    this.store.dispatch(fromAction.RemoveDashboardAlert({ id }));
  }

  setSelectedTask(selectedTask: TaskObject): void {
    this.selectedTask = selectedTask;
  }
}
