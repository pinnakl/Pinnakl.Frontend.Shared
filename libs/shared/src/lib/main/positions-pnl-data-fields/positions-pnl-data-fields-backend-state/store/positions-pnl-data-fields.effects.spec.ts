import { TestBed } from '@angular/core/testing';

import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';

import {
  PositionsPnlDataField,
  PositionsPnlDataFieldsService
} from '../../positions-pnl-data-fields-backend';
import {
  AttemptLoadPositionsPnlDataFields,
  LoadPositionsPnlDataFields,
  LoadPositionsPnlDataFieldsFailed
} from './positions-pnl-data-fields.actions';
import { PositionsPnlDataFieldsEffects } from './positions-pnl-data-fields.effects';

describe('PositionsPnlDataFieldsEffects', () => {
  let actions$: Observable<any>;
  let effects: PositionsPnlDataFieldsEffects;
  let service: PositionsPnlDataFieldsService;

  const mockEntities: PositionsPnlDataField[] = [
    { id: 1, name: 'Sector', field: 'sector', type: 'security' }
  ];
  const mockService = {
    getAll: () => {}
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PositionsPnlDataFieldsEffects,
        provideMockActions(() => actions$),
        {
          provide: PositionsPnlDataFieldsService,
          useValue: mockService
        }
      ]
    });
    effects = TestBed.inject(PositionsPnlDataFieldsEffects);
    service = TestBed.inject(PositionsPnlDataFieldsService);
  });

  describe('load$', () => {
    it('should dispatch a Load action if Load succeeds', async () => {
      spyOn(service, 'getAll').and.returnValue(Promise.resolve(mockEntities));
      const action = new AttemptLoadPositionsPnlDataFields(),
        completion = new LoadPositionsPnlDataFields({
          positionsPnlDataFields: mockEntities
        });
      actions$ = of(action);
      const result = await effects.load$.pipe(take(1)).toPromise();
      expect(result).toEqual(completion);
    });
    it('should dispatch an Load Failed action if Load fails', async () => {
      const error = 'already exists';
      spyOn(service, 'getAll').and.returnValue(Promise.reject(error));
      const action = new AttemptLoadPositionsPnlDataFields(),
        completion = new LoadPositionsPnlDataFieldsFailed({
          error
        });
      actions$ = of(action);
      const result = await effects.load$.pipe(take(1)).toPromise();
      expect(result).toEqual(completion);
    });
  });
});
