import { TestBed } from '@angular/core/testing';

import { provideMockActions } from '@ngrx/effects/testing';
import { AumBackendStateFacade } from '@pnkl-frontend/shared';
import { Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { PnlBackendStateFacade } from '../../../pnl-backend-state/pnl-backend-state-facade.service';

import { PnlFilter } from '../../../pnl-backend/pnl-calculated/pnl-calculated-filter.model';
import { SetPnlFilter } from './pnl-filters.actions';
import { PnlFiltersEffects } from './pnl-filters.effects';

describe('PnlFiltersEffects', () => {
  let actions$: Observable<any>;
  let effects: PnlFiltersEffects;
  let service: PnlBackendStateFacade;
  let aumBackendStateFacade: AumBackendStateFacade;

  const mockAumBackendStateFacade = {
    loadAum: () => {}
  };
  const mockPnlBackendStateFacade = {
    loadPnlCalculatedAttributes: () => {},
    loadPnlCalculateds: () => {}
  };
  const mockPnlFilterValue: PnlFilter = {
    endDate: new Date(),
    startDate: new Date(),
    account: <any>{ id: 2 }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PnlFiltersEffects,
        provideMockActions(() => actions$),
        {
          provide: AumBackendStateFacade,
          useValue: mockAumBackendStateFacade
        },
        {
          provide: PnlBackendStateFacade,
          useValue: mockPnlBackendStateFacade
        }
      ]
    });
    aumBackendStateFacade = TestBed.inject(AumBackendStateFacade);
    effects = TestBed.inject(PnlFiltersEffects);
    service = TestBed.inject(PnlBackendStateFacade);
  });

  describe('load$', () => {
    it('should load pnl data for the provided filters', async () => {
      spyOn(aumBackendStateFacade, 'loadAum').and.callThrough();
      spyOn(service, 'loadPnlCalculatedAttributes').and.callThrough();
      const action = new SetPnlFilter(mockPnlFilterValue);
      actions$ = of(action);
      await effects.load$.pipe(take(1)).toPromise();
      expect(aumBackendStateFacade.loadAum).toHaveBeenCalledWith({
        accountId: +mockPnlFilterValue.account.id,
        date: mockPnlFilterValue.endDate
      });
      expect(service.loadPnlCalculatedAttributes).toHaveBeenCalledWith(
        mockPnlFilterValue
      );
    });
  });
});
