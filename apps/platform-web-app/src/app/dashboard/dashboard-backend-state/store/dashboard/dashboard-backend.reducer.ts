import { Action, createReducer, on } from '@ngrx/store';
import { DashboardBackend } from '../../../dashboard-backend/dashboard/dashboard-backend.model';
import {
  AddDashboardAlert,
  AttemptLoadDashboardBackend,
  LoadActivitySummary,
  LoadDashboardBackend,
  LoadDashboardBackendFailed,
  RemoveDashboardAlert
} from './dashboard-backend.actions';

export interface State {
  loaded: boolean;
  loading: boolean;
  data: DashboardBackend;
}

export const initialState: State = {
  loaded: false,
  loading: false,
  data: {
    // pnl: {
    //   daily: 89.12,
    //   MTD: 89.12,
    //   YTD: 89.12
    // },
    // actions: ['a', 'a'],
    // alerts: [
    //   {
    //     id: 43003,
    //     clientId: 2,
    //     notificationType: 1,
    //     notification:
    //       'FTP files downloaded for JPM server for 12/14/2018 at {datetimeoffset}',
    //     date: new Date('12/16/2018 9:57:10 PM'),
    //     isoDate: new Date('12/16/2018 9:57:10 PM')
    //   }
    // ],
    // activitySummary: {
    //   pnlAssetType: [{ type: 'BANKDEBT', exposure: 12.12, change: 12.12 }],
    //   pnlSector: [{ type: 'BANKDEBT', exposure: 12.12, change: 12.12 }],
    //   positionsAdded: [
    //     {
    //       ticker: 'FTR DE',
    //       position: 3247000.0,
    //       description: 'Frontier Communications Corp 10.5% 9/15/22',
    //       direction: 'Long'
    //     }
    //   ],
    //   positionsExited: [
    //     {
    //       ticker: 'FTR DE',
    //       position: 3247000.0,
    //       description: 'Frontier Communications Corp 10.5% 9/15/22',
    //       direction: 'Long'
    //     }
    //   ]
    // }
  } as DashboardBackend
};

const featureReducer = createReducer(
  initialState,
  on(AttemptLoadDashboardBackend, (state) => ({
    ...state,
    loaded: false,
    loading: true
  })),
  on(LoadDashboardBackend, (state, { dashboardBackend }) => ({
    ...state,
    loaded: true,
    loading: false,
    data: dashboardBackend
  })),
  on(LoadDashboardBackendFailed, (state) => ({
    ...state,
    loaded: false,
    loading: false
  })),
  on(LoadActivitySummary, (state, { activitySummary }) => ({
    ...state,
    data: {
      ...state.data,
      activitySummary: activitySummary
    }
  })),
  on(AddDashboardAlert, (state, { payload }) => ({
    ...state,
    data: {
      ...state.data,
      alerts: [...state.data.alerts, payload]
    }
  })),
  on(RemoveDashboardAlert, (state, { id }) => ({
    ...state,
    data: {
      ...state.data,
      alerts: [
        ...state.data.alerts.filter(alert => alert.id !== id)
      ]
    }
  }))
);

export function reducer(state: State | undefined, action: Action): State {
  return featureReducer(state, action);
}

export const selectAll = (state: State) => state.data;
export const selectPnl = (state: State) => state.data.pnl;
export const selectActions = (state: State) => state.data.actions;
export const selectAlerts = (state: State) => state.data.alerts;
export const selectFulfilledTasks = (state: State) => state.data.fulfilledTasks;
export const selectClientConnectivity = (state: State) => state.data.clientConnectivity;
export const selectActivitySummary = (state: State) =>
  state.data.activitySummary;
export const selectLoaded = (state: State) => state.loaded;
