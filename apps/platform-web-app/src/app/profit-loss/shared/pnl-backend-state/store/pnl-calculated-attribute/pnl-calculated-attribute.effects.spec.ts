import { TestBed } from '@angular/core/testing';

import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { PnlCalculatedAttribute } from '../../../pnl-backend/pnl-calculated-attribute/pnl-calculated-attribute.model';
import { PnlCalculatedAttributeService } from '../../../pnl-backend/pnl-calculated-attribute/pnl-calculated-attribute.service';

import {
  AttemptLoadPnlCalculatedAttributes,
  LoadPnlCalculatedAttributes,
  LoadPnlCalculatedAttributesFailed
} from './pnl-calculated-attribute.actions';
import { PnlCalculatedAttributeEffects } from './pnl-calculated-attribute.effects';

describe('PnlCalculatedAttributeEffect', () => {
  let actions$: Observable<any>;
  let effects: PnlCalculatedAttributeEffects;
  let service: PnlCalculatedAttributeService;

  const mockPnlCalculatedAttributeService = {
    getMany: () => {}
  };
  const mockPnlCalculatedAttribute: PnlCalculatedAttribute = {
    attributeId: 4,
    realizedPnl: 5,
    securityId: 6,
    totalPnl: 7,
    unrealizedPnl: 6.8,
    Analyst: 'A1'
  } as any;
  const mockPnlCalculatedAttributes = [mockPnlCalculatedAttribute];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PnlCalculatedAttributeEffects,
        provideMockActions(() => actions$),
        {
          provide: PnlCalculatedAttributeService,
          useValue: mockPnlCalculatedAttributeService
        }
      ]
    });
    effects = TestBed.inject(PnlCalculatedAttributeEffects);
    service = TestBed.inject(PnlCalculatedAttributeService);
  });

  describe('load$', () => {
    it('should dispatch a Load action if Load succeeds', async () => {
      spyOn(service, 'getMany').and.returnValue(
        Promise.resolve(mockPnlCalculatedAttributes)
      );
      const action = new AttemptLoadPnlCalculatedAttributes({
          accountId: 1,
          startDate: null,
          endDate: null
        }),
        completion = new LoadPnlCalculatedAttributes({
          pnlCalculatedAttributes: mockPnlCalculatedAttributes
        });
      actions$ = of(action);
      const result = await effects.load$.pipe(take(1)).toPromise();
      expect(result).toEqual(completion);
    });
    it('should dispatch an Load Failed action if Load fails', async () => {
      const error = 'already exists';
      spyOn(service, 'getMany').and.returnValue(Promise.reject(error));
      const action = new AttemptLoadPnlCalculatedAttributes({
          accountId: 1,
          startDate: null,
          endDate: null
        }),
        completion = new LoadPnlCalculatedAttributesFailed({
          error
        });
      actions$ = of(action);
      const result = await effects.load$.pipe(take(1)).toPromise();
      expect(result).toEqual(completion);
    });
  });
});
