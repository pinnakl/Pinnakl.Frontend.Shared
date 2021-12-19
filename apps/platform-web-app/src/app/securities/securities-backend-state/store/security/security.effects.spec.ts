import { TestBed } from '@angular/core/testing';

import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';

import { SecurityService } from '@pnkl-frontend/shared';
import {
  AttemptLoadSecurities,
  LoadSecurities,
  LoadSecuritiesFailed
} from './security.actions';
import { SecurityEffects } from './security.effects';

const securityService = { getAllSecurities: () => {} };
const security = {
  assetType: 'equity',
  assetTypeId: 6,
  countryOfIncorporation: 'USA',
  countryOfRisk: 'USA',
  currency: 'USD',
  currencyId: 21,
  cusip: '829226109',
  dataSourceId: null,
  description: 'Sinclair Broad-a',
  id: 2,
  identifier: () => 'SBGI',
  isin: '',
  isListed: () => true,
  loanId: '',
  manualPricingIndicator: false,
  moodyRating: '',
  multiplier: 1,
  opraCode: '',
  organizationId: null,
  organizationName: null,
  organizationStatusDescription: null,
  organizationStatusId: 'as',
  organizationTicker: 'as',
  privateIndicator: false,
  sandpRating: '',
  securityType: 'equity',
  securityTypeId: 1,
  securityTypeDescription: 'Equity',
  sector: 'Energy',
  sedol: '2799351',
  ticker: 'SBGI',
  principalFactor: 1
};
const securities: any = [security];

describe('SecurityEffects', () => {
  let actions$: Observable<any>;
  let effects: SecurityEffects;
  let service: SecurityService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SecurityEffects,
        provideMockActions(() => actions$),
        { provide: SecurityService, useValue: securityService }
      ]
    });
    effects = TestBed.inject(SecurityEffects);
    service = TestBed.inject(SecurityService);
  });

  describe('load$', () => {
    it('should dispatch a Load action if getAllSecurities succeeds', done => {
      spyOn(service, 'getAllSecurities').and.returnValue(
        Promise.resolve(securities)
      );
      const action = new AttemptLoadSecurities(),
        completion = new LoadSecurities({ securities });
      actions$ = of(action);
      effects.load$.subscribe(result => {
        expect(result).toEqual(completion);
        done();
      });
    });
    it('should dispatch a Load Failed action if getAllSecurities fails', done => {
      const error = 'already exists';
      spyOn(service, 'getAllSecurities').and.returnValue(Promise.reject(error));
      const action = new AttemptLoadSecurities(),
        completion = new LoadSecuritiesFailed({ error });
      actions$ = of(action);
      effects.load$.subscribe(result => {
        expect(result).toEqual(completion);
        done();
      });
    });
  });
});
