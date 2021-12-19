import { TestBed } from '@angular/core/testing';

import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';

import { CurrencyForOMS } from '../../../../../models/oms/currency.model';
import { OMSService } from '../../../../../pinnakl-web-services/oms.service';
import {
  AttemptLoadCurrencies,
  LoadCurrencies,
  LoadCurrenciesFailed
} from './currency.actions';
import { CurrencyEffects } from './currency.effects';

describe('CurrencyService', () => {
  let actions$: Observable<AttemptLoadCurrencies>;
  let effects: CurrencyEffects;
  let service: OMSService;

  const currencies = getCurrencies();
  const omsService = {
    getCurrencies: () => {}
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CurrencyEffects,
        provideMockActions(() => actions$),
        {
          provide: OMSService,
          useValue: omsService
        }
      ]
    });
    effects = TestBed.inject(CurrencyEffects);
    service = TestBed.inject(OMSService);
  });

  describe('load$', () => {
    beforeEach(() => {
      actions$ = of(new AttemptLoadCurrencies());
    });
    it('should dispatch a Load action if Load succeeds', done => {
      spyOn(service, 'getCurrencies').and.returnValue(
        Promise.resolve(currencies)
      );
      const completion = new LoadCurrencies({ currencies });
      effects.load$.subscribe(result => {
        expect(result).toEqual(completion);
        done();
      });
    });
    it('should dispatch a LoadFaild action if Load fails', done => {
      const error = 'server busy';
      spyOn(service, 'getCurrencies').and.returnValue(Promise.reject(error));
      const completion = new LoadCurrenciesFailed({ error });
      effects.load$.subscribe(result => {
        expect(result).toEqual(completion);
        done();
      });
    });
  });
});

function getCurrencies(): CurrencyForOMS[] {
  return [
    {
      id: 1,
      currency: 'USD'
    },
    {
      id: 2,
      currency: 'AUD'
    }
  ];
}
