import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';

import { Observable, of } from 'rxjs';

import { Currency, FxRate, OMSService, Utility } from '@pnkl-frontend/shared';
import {
  AttemptLoadSelectedCurrency,
  LoadSelectedCurrency
} from './selected-currency.actions';
import { SelectedCurrencyEffects } from './selected-currency.effects';

describe('SelectedCurrencyService', () => {
  let actions$: Observable<any> = new Observable<any>();
  let effects: SelectedCurrencyEffects;
  let service: OMSService;
  let utilityService: Utility;
  const mockOMSService = { getFxRate: () => {} },
    mockFxRate: FxRate = {
      id: 1,
      currencyId: 1,
      fxRate: 1.5,
      priceDate: new Date()
    },
    mockFXRateArgument: { date: Date; currency: any } = {
      date: new Date(),
      currency: { id: 1, currency: 'USD' }
    },
    mockUtility = { showError: () => {} };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SelectedCurrencyEffects,
        provideMockActions(() => actions$),
        { provide: OMSService, useValue: mockOMSService },
        { provide: Utility, useValue: mockUtility }
      ]
    });

    effects = TestBed.inject(SelectedCurrencyEffects);
    service = TestBed.inject(OMSService);
    utilityService = TestBed.inject(Utility);
  });

  describe('load$', () => {
    it('should dispatch load function if Attempt Load succeds', () => {
      spyOn(service, 'getFxRate').and.returnValue(Promise.resolve(mockFxRate));

      const action = AttemptLoadSelectedCurrency(mockFXRateArgument),
        { currencyId, fxRate } = mockFxRate,
        completion = LoadSelectedCurrency({
          payload: { currencyId, fxRate }
        });
      actions$ = of(action);
      effects.load$.subscribe(result => expect(result).toEqual(completion));
    });
  });
});
