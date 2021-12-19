import { AlertModel } from '../../../dashboard-backend/dashboard/alert.model';
import {
  AddDashboardAlert,
  AttemptLoadDashboardBackend,
  LoadActivitySummary,
  LoadDashboardBackend,
  LoadDashboardBackendFailed
} from './dashboard-backend.actions';
import { initialState, reducer } from './dashboard-backend.reducer';

describe('DashboardBackend Reducer', () => {
  const data: any = {
    pnl: {
      daily: 89.12,
      MTD: 89.12,
      YTD: 89.12
    },
    actions: ['a', 'a'],
    alerts: [
      {
        id: 43003,
        clientId: 2,
        notificationType: 1,
        notification:
          'FTP files downloaded for JPM server for 12/14/2018 at {datetimeoffset}',
        date: new Date('12/16/2018 9:57:10 PM'),
        isoDate: new Date('12/16/2018 9:57:10 PM')
      }
    ],
    activitySummary: {
      pnlAssetType: [{ type: 'BANKDEBT', exposure: 12.12, change: 12.12 }],
      pnlSector: [{ type: 'BANKDEBT', exposure: 12.12, change: 12.12 }],
      positionsAdded: [
        {
          ticker: 'FTR DE',
          position: 3247000.0,
          description: 'Frontier Communications Corp 10.5% 9/15/22',
          direction: 'Long'
        }
      ],
      positionsExited: [
        {
          ticker: 'FTR DE',
          position: 3247000.0,
          description: 'Frontier Communications Corp 10.5% 9/15/22',
          direction: 'Long'
        }
      ]
    }
  };

  describe('Attempt Load Dashboard Backend action', () => {
    it('should return the initial state', () => {
      const action = new AttemptLoadDashboardBackend();

      const result = reducer(initialState, action);

      expect(result).toEqual({
        ...initialState,
        loaded: false,
        loading: true
      });
    });
  });

  describe('Load Dashboard Backend Failed action', () => {
    it('should return the initial state', () => {
      const action = new LoadDashboardBackendFailed({ error: 'error' });

      const result = reducer(initialState, action);

      expect(result).toEqual({
        ...initialState,
        loaded: false,
        loading: false
      });
    });
  });

  describe('Load Dashboard Backend action', () => {
    it('should return the new state', () => {
      const action = new LoadDashboardBackend({ dashboardBackend: data });

      const result = reducer(initialState, action);
      expect(result).toEqual({
        ...initialState,
        loaded: true,
        loading: false,
        data: data
      });
    });
  });

  describe('Load Activity Summary action', () => {
    it('should return new state', () => {
      const activitySummaryData = {
        pnlAssetType: [{ type: 'BANKDEBT', exposure: 12.12, change: 12.12 }],
        pnlSector: [{ type: 'BANKDEBT', exposure: 12.12, change: 12.12 }],
        positionsAdded: [
          {
            ticker: 'FTR DE',
            position: 3247000.0,
            description: 'Frontier Communications Corp 10.5% 9/15/22',
            direction: 'Long'
          }
        ],
        positionsExited: [
          {
            ticker: 'FTR DE',
            position: 3247000.0,
            description: 'Frontier Communications Corp 10.5% 9/15/22',
            direction: 'Long'
          }
        ]
      };

      const action = new LoadActivitySummary({
        activitySummary: activitySummaryData
      });

      const result = reducer(initialState, action);

      expect(result).toEqual({
        ...initialState,
        data: {
          ...initialState.data,
          activitySummary: activitySummaryData
        }
      });
    });
  });

  describe('Load Dashboard Backend Failed action', () => {
    it('should return the initial state', () => {
      const alertData: AlertModel = {
        id: 43003,
        clientId: 2,
        notificationType: 1,
        notification:
          'FTP files downloaded for JPM server for 12/14/2018 at {datetimeoffset}',
        date: new Date('12/16/2018 9:57:10 PM'),
        isoDate: new Date('12/16/2018 9:57:10 PM')
      };

      const actionDashboard = new LoadDashboardBackend({
        dashboardBackend: data
      });

      const resultDashbaord = reducer(initialState, actionDashboard);

      const action = new AddDashboardAlert(alertData);

      const result = reducer(resultDashbaord, action);

      expect(result).toEqual({
        ...resultDashbaord,
        data: {
          ...resultDashbaord.data,
          alerts: [...resultDashbaord.data.alerts, alertData]
        }
      });
    });
  });
});
