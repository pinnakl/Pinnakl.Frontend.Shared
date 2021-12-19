import { TestBed } from '@angular/core/testing';

import { Store } from '@ngrx/store';
import { StoreModule } from '@ngrx/store';
import { take } from 'rxjs/operators';

import { Account } from '@pnkl-frontend/shared';
import { PnlCalculatedAttribute } from '../pnl-backend/pnl-calculated-attribute/pnl-calculated-attribute.model';
import { PnlFilter } from '../pnl-backend/pnl-calculated/pnl-calculated-filter.model';
import { PnlBackendStateFacade } from './pnl-backend-state-facade.service';
import { reducers, State } from './store';

import {
  AttemptLoadPnlCalculatedAttributes,
  LoadPnlCalculatedAttributes
} from './store/pnl-calculated-attribute/pnl-calculated-attribute.actions';
import { initialState as pnlCalculatedAttributeInitialState } from './store/pnl-calculated-attribute/pnl-calculated-attribute.reducer';

describe('PnlBackendStateFacade', () => {
  let facade: PnlBackendStateFacade;
  let store: Store<State>;

  const mockPnlCalculatedAttributes: PnlCalculatedAttribute[] = [
    { attributeId: 1 },
    { attributeId: 2 }
  ] as PnlCalculatedAttribute[];
  const mockPnlFilter: PnlFilter = {
    account: { id: '1' } as Account,
    endDate: new Date(),
    startDate: new Date('01/01/2018')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PnlBackendStateFacade]
    });
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        StoreModule.forFeature('pnlBackend', reducers)
      ],
      providers: [PnlBackendStateFacade]
    });
    facade = TestBed.inject(PnlBackendStateFacade);
    store = TestBed.inject(Store);
  });

  describe('pnlCalculatedAttributes$', () => {
    it('should select the pnlCalculatedAttributes', async () => {
      const initialValue = await _getPnlCalculatedAttributes();
      expect(initialValue).toEqual(
        pnlCalculatedAttributeInitialState.pnlCalculatedAttributes
      );
      _dispatchLoadPnlCalculatedAttributes(mockPnlCalculatedAttributes);
      const newValue = await _getPnlCalculatedAttributes();
      expect(newValue).toEqual(mockPnlCalculatedAttributes);
    });
  });

  describe('pnlCalculatedAttributesLoaded$', () => {
    it('should select the pnlCalculatedAttributesLoaded', async () => {
      const initialValue = await _getPnlCalculatedAttributesLoaded();
      expect(initialValue).toEqual(pnlCalculatedAttributeInitialState.loaded);
      _dispatchLoadPnlCalculatedAttributes(mockPnlCalculatedAttributes);
      const newValue = await _getPnlCalculatedAttributesLoaded();
      expect(newValue).toEqual(true);
    });
  });

  describe('loadPnlCalculatedAttributes()', () => {
    it('should dispatch the AttemptLoadPnlCalculatedAttributes action', () => {
      spyOn(store, 'dispatch').and.callThrough();
      facade.loadPnlCalculatedAttributes(mockPnlFilter);
      const pnlCalculatedAttributeFilter = {
        accountId: +mockPnlFilter.account.id,
        endDate: mockPnlFilter.endDate,
        startDate: mockPnlFilter.startDate
      };
      const expectedAction = AttemptLoadPnlCalculatedAttributes(
        pnlCalculatedAttributeFilter
      );
      expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });
  });

  function _dispatchLoadPnlCalculatedAttributes(
    entities: PnlCalculatedAttribute[]
  ): void {
    store.dispatch(
      LoadPnlCalculatedAttributes({ pnlCalculatedAttributes: entities })
    );
  }

  async function _getPnlCalculatedAttributes(): Promise<
    PnlCalculatedAttribute[]
  > {
    return facade.pnlCalculatedAttributes$.pipe(take(1)).toPromise();
  }

  async function _getPnlCalculatedAttributesLoaded(): Promise<boolean> {
    return facade.pnlCalculatedAttributesLoaded$.pipe(take(1)).toPromise();
  }
});
