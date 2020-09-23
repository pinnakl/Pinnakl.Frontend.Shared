import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';

import { DashboardService } from '../../../dashboard-backend/dashboard';
import { DashboardBackendEffects } from './dashboard-backend.effects';

import { DashboardBackend } from '../../../dashboard-backend/dashboard';
import {
  AttemptLoadActivitySummary,
  AttemptLoadDashboardBackend,
  LoadActivitySummary,
  LoadDashboardBackend
} from './dashboard-backend.actions';

import * as moment from 'moment';
describe('DashboardBackendService', () => {
  let actions$: Observable<any>;
  let effects: DashboardBackendEffects;
  let service: DashboardService;

  const dahsboardData: DashboardBackend = {
    pnl: {
      daily: 0,
      MTD: 0,
      YTD: 0
    },
    actions: [
      'Run Reconciliation',
      'Send Trade Files',
      'View portfolio exposure by sector for Master fund',
      'Review risk limits for compliance'
    ],
    alerts: [
      {
        id: 44854,
        clientId: 3,
        notificationType: 1,
        notification: 'End of Day Risk run for 01/11/2019 at 5:30 PM',
        date: new Date('2019-01-11T23:30:16.000Z'),
        isoDate: new Date('2019-01-11T23:30:16.000Z')
      }
    ],
    activitySummary: {
      pnlAssetType: [
        {
          type: 'bankdebt',
          exposure: 0,
          change: 0
        },
        {
          type: 'bond',
          exposure: 70.9626303501068,
          change: 2.36434373500397
        },
        {
          type: 'crncy',
          exposure: 0,
          change: 0
        },
        {
          type: 'equity',
          exposure: 3.52276644623575,
          change: 0.576212351557506
        },
        {
          type: 'fund',
          exposure: -5.31365584403769,
          change: -0.566203166566098
        },
        {
          type: 'option',
          exposure: 0,
          change: 0
        },
        {
          type: 'pfd',
          exposure: 3.04854731720292,
          change: -0.0313020483462796
        }
      ],
      pnlSector: [
        {
          type: 'AIRLINES',
          exposure: 3.50360552949599,
          change: -0.0180598223169897
        },
        {
          type: 'Basic Materials',
          exposure: 0,
          change: 0
        },
        {
          type: 'CASH',
          exposure: 0,
          change: 0
        },
        {
          type: 'Consumer Discretionary',
          exposure: 3.81035836210208,
          change: 0.00205777930113138
        },
        {
          type: 'Consumer, Cyclical',
          exposure: 0,
          change: 0
        },
        {
          type: 'Consumer, Non-cyclical',
          exposure: 0.73441995812784,
          change: 0.0180040530679189
        },
        {
          type: 'Diversified',
          exposure: 3.36524756650983,
          change: 0.0794940370041695
        },
        {
          type: 'Financial',
          exposure: 5.13007516855547,
          change: -2.36497606386284
        },
        {
          type: 'Food & Beverage',
          exposure: 3.40843746027692,
          change: 0.0144995309365568
        },
        {
          type: 'Funds',
          exposure: -5.31365584403769,
          change: -0.566203166566098
        },
        {
          type: 'Gaming',
          exposure: 2.2617573581017,
          change: 0.346082904729987
        },
        {
          type: 'Health Care',
          exposure: 2.88170318350412,
          change: 0.00038609311333726
        },
        {
          type: 'Industrial',
          exposure: 2.91470739167694,
          change: 0.0771086611554748
        },
        {
          type: 'Manufactured Goods',
          exposure: 2.74003870743842,
          change: 0.0147313909002071
        },
        {
          type: 'Media',
          exposure: 0.187818523829079,
          change: 0.00415304006844636
        },
        {
          type: 'Metals & Mining',
          exposure: 4.47621721106738,
          change: 0.141700620365375
        },
        {
          type: 'OIL & GAS',
          exposure: 7.60848425563083,
          change: 2.45512343626187
        },
        {
          type: 'Oil & Gas Services',
          exposure: 10.8770623269246,
          change: 1.26170532898635
        },
        {
          type: 'Paper products',
          exposure: 1.08831397823364,
          change: 0.138632621529561
        },
        {
          type: 'Retail',
          exposure: 3.3043987390817,
          change: -0.0295038041012492
        },
        {
          type: 'Technology',
          exposure: 11.6685014361319,
          change: 0.498629509734874
        },
        {
          type: 'Transportation',
          exposure: 7.57279695685707,
          change: 0.269484721341009
        }
      ],
      positionsAdded: [
        {
          ticker: 'FWD',
          position: -1617000,
          description: 'USD/GBP - 12/28/2018',
          direction: 'Short'
        },
        {
          ticker: 'NOR',
          position: 2141000,
          description: 'Noranda Aluminum Acquisition Corporation',
          direction: 'Long'
        }
      ],
      positionsExited: [
        {
          ticker: 'FWD',
          position: -3804000,
          description: 'USD/GBP - 2/8/2019',
          direction: 'Short'
        }
      ]
    }
  };

  const activitySummaryData = {
    pnlAssetType: [
      {
        type: 'bankdebt',
        exposure: 0,
        change: 0
      },
      {
        type: 'bond',
        exposure: 70.9626303501068,
        change: 2.36434373500397
      },
      {
        type: 'crncy',
        exposure: 0,
        change: 0
      },
      {
        type: 'equity',
        exposure: 3.52276644623575,
        change: 0.576212351557506
      },
      {
        type: 'fund',
        exposure: -5.31365584403769,
        change: -0.566203166566098
      },
      {
        type: 'option',
        exposure: 0,
        change: 0
      },
      {
        type: 'pfd',
        exposure: 3.04854731720292,
        change: -0.0313020483462796
      }
    ],
    pnlSector: [
      {
        type: 'AIRLINES',
        exposure: 3.50360552949599,
        change: -0.0180598223169897
      },
      {
        type: 'Basic Materials',
        exposure: 0,
        change: 0
      },
      {
        type: 'CASH',
        exposure: 0,
        change: 0
      },
      {
        type: 'Consumer Discretionary',
        exposure: 3.81035836210208,
        change: 0.00205777930113138
      },
      {
        type: 'Consumer, Cyclical',
        exposure: 0,
        change: 0
      },
      {
        type: 'Consumer, Non-cyclical',
        exposure: 0.73441995812784,
        change: 0.0180040530679189
      },
      {
        type: 'Diversified',
        exposure: 3.36524756650983,
        change: 0.0794940370041695
      },
      {
        type: 'Financial',
        exposure: 5.13007516855547,
        change: -2.36497606386284
      },
      {
        type: 'Food & Beverage',
        exposure: 3.40843746027692,
        change: 0.0144995309365568
      },
      {
        type: 'Funds',
        exposure: -5.31365584403769,
        change: -0.566203166566098
      },
      {
        type: 'Gaming',
        exposure: 2.2617573581017,
        change: 0.346082904729987
      },
      {
        type: 'Health Care',
        exposure: 2.88170318350412,
        change: 0.00038609311333726
      },
      {
        type: 'Industrial',
        exposure: 2.91470739167694,
        change: 0.0771086611554748
      },
      {
        type: 'Manufactured Goods',
        exposure: 2.74003870743842,
        change: 0.0147313909002071
      },
      {
        type: 'Media',
        exposure: 0.187818523829079,
        change: 0.00415304006844636
      },
      {
        type: 'Metals & Mining',
        exposure: 4.47621721106738,
        change: 0.141700620365375
      },
      {
        type: 'OIL & GAS',
        exposure: 7.60848425563083,
        change: 2.45512343626187
      },
      {
        type: 'Oil & Gas Services',
        exposure: 10.8770623269246,
        change: 1.26170532898635
      },
      {
        type: 'Paper products',
        exposure: 1.08831397823364,
        change: 0.138632621529561
      },
      {
        type: 'Retail',
        exposure: 3.3043987390817,
        change: -0.0295038041012492
      },
      {
        type: 'Technology',
        exposure: 11.6685014361319,
        change: 0.498629509734874
      },
      {
        type: 'Transportation',
        exposure: 7.57279695685707,
        change: 0.269484721341009
      }
    ],
    positionsAdded: [
      {
        ticker: 'FWD',
        position: -1617000,
        description: 'USD/GBP - 12/28/2018',
        direction: 'Short'
      },
      {
        ticker: 'NOR',
        position: 2141000,
        description: 'Noranda Aluminum Acquisition Corporation',
        direction: 'Long'
      }
    ],
    positionsExited: [
      {
        ticker: 'FWD',
        position: -3804000,
        description: 'USD/GBP - 2/8/2019',
        direction: 'Short'
      }
    ]
  };

  const mockDashboardDataService = {
    getDashboardData: () => {},
    getActivitySummaryData: () => {}
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DashboardBackendEffects,
        provideMockActions(() => actions$),
        {
          provide: DashboardService,
          useValue: mockDashboardDataService
        }
      ]
    });

    effects = TestBed.get(DashboardBackendEffects);
    service = TestBed.get(DashboardService);
  });

  describe('attempt load dashboard action$', () => {
    it('should listen to Attemp Load dashboard Data and dispatch load dashboard data action', () => {
      spyOn(service, 'getDashboardData').and.returnValue(
        Promise.resolve(dahsboardData)
      );
      const action = new AttemptLoadDashboardBackend(),
        completion = new LoadDashboardBackend({
          dashboardBackend: dahsboardData
        });

      actions$ = of(action);
      effects.loadDashboard$.subscribe(result => {
        return expect(result).toEqual(completion);
      });
    });
  });

  describe('attempt load activity summary action$', () => {
    it('should listen to Attemp Load activity summary Data and dispatch load activity summary data action', () => {
      spyOn(service, 'getActivitySummaryData').and.returnValue(
        Promise.resolve(activitySummaryData)
      );
      const action = new AttemptLoadActivitySummary({
          startDate: new Date(
            moment()
              .subtract(1, 'months')
              .format('MM-DD-YYYY')
          ),
          endDate: new Date()
        }),
        completion = new LoadActivitySummary({
          activitySummary: activitySummaryData
        });

      actions$ = of(action);
      effects.loadActivitySummary$.subscribe(result => {
        return expect(result).toEqual(completion);
      });
    });
  });
});
