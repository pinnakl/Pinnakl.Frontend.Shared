import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import {
  AttemptLoadActivitySummary,
  AttemptLoadDashboardBackend,
  LoadActivitySummary
} from '../../dashboard-backend-state/store/dashboard';
import { Utility } from '@pnkl-frontend/shared';
import { DashboardUiEffects } from './dashboard-ui.effects';

import * as moment from 'moment';

describe('DashboardUi Effects Tests - ', () => {
  let actions$: Observable<any>;
  let effects: DashboardUiEffects;
  let spinner: PinnaklSpinner;
  let utility: Utility;

  beforeEach(() => {
    spinner = jasmine.createSpyObj('spinner', ['spin', 'stop']);
    TestBed.configureTestingModule({
      providers: [
        DashboardUiEffects,
        provideMockActions(() => actions$),
        {
          provide: PinnaklSpinner,
          useValue: spinner
        },
        {
          provide: Utility,
          useValue: utility
        }
      ]
    });

    effects = TestBed.get(DashboardUiEffects);
  });

  const activitySummaryData = {
    pnlAssetType: [
      {
        type: 'bankdebt',
        exposure: 0,
        change: 0
      }
    ],
    pnlSector: [
      {
        type: 'AIRLINES',
        exposure: 3.50360552949599,
        change: -0.0180598223169897
      }
    ],
    positionsAdded: [
      {
        ticker: 'FWD',
        position: -1617000,
        description: 'USD/GBP - 12/28/2018',
        direction: 'Short'
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

  describe('spinner show and hide test for Dashboard data - ', () => {
    it('spinner should be shown', () => {
      actions$ = of(new AttemptLoadDashboardBackend());

      effects.applyDashboardSpiner$.subscribe(result => result);
      expect(spinner.spin).toHaveBeenCalled();
    });
  });

  describe('spinner show and hide test for Activity data - ', () => {
    it('success action dispatched', async () => {
      actions$ = of(
        new AttemptLoadActivitySummary({
          startDate: new Date(
            moment()
              .subtract(1, 'months')
              .format('MM-DD-YYYY')
          ),
          endDate: new Date()
        }),
        new LoadActivitySummary({ activitySummary: activitySummaryData })
      );
      effects.applyActivitySummarySpiner$.subscribe();
      expect(spinner.spin).toHaveBeenCalledTimes(1);
      expect(spinner.stop).toHaveBeenCalledTimes(1);
    });
  });
});
