import { TestBed } from '@angular/core/testing';

import { StoreModule } from '@ngrx/store';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import { Utility } from '@pnkl-frontend/shared';
import { PnlBackendStateFacade } from '../pnl-backend-state/pnl-backend-state-facade.service';
import { PnlCalculatedTimeseriesService } from '../pnl-backend/pnl-calculated-timeseries/pnl-calculated-timeseries.service';
import { PnlFilter } from '../pnl-backend/pnl-calculated/pnl-calculated-filter.model';
import { PnlUiStateFacadeService } from './pnl-ui-state-facade.service';
import {
  reducers,
  RemoveField,
  SelectFields,
  SetPnlFilter,
  SetPnlFilterFromUi,
  State
} from './store';
import { initialState as pnlFieldsSelectedInitialState } from './store/pnl-fields-selected/pnl-fields-selected.reducer';
import { initialState as pnlFiltersInitialState } from './store/pnl-filters/pnl-filters.reducer';

describe('PnlUiStateFacadeService', () => {
  let facade: PnlUiStateFacadeService;
  let store: Store<State>;

  const pnlFilter: PnlFilter = {
    endDate: new Date(),
    startDate: new Date(),
    account: <any>{}
  };
  const selectedPnlFields = [101, 102];

  const mockPnlBackendStateFacade = {};
  const mockPnlCalculatedTimeseriesService = {};
  const mockPinnaklSpinner = {};
  const mockUtility = {};
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        StoreModule.forFeature('pnlUi', reducers)
      ],
      providers: [
        PnlUiStateFacadeService,
        { provide: PnlBackendStateFacade, useValue: mockPnlBackendStateFacade },
        { provide: PinnaklSpinner, useValue: mockPinnaklSpinner },
        {
          provide: PnlCalculatedTimeseriesService,
          useValue: mockPnlCalculatedTimeseriesService
        },
        { provide: Utility, useValue: mockUtility }
      ]
    });
    facade = TestBed.inject(PnlUiStateFacadeService);
    store = TestBed.inject(Store);
  });

  describe('pnlFieldsSelected$', () => {
    it('should select pnlFieldsSelected', async () => {
      const initialValue = await _getPnlFieldsSelected();
      expect(initialValue).toBe(pnlFieldsSelectedInitialState.ids);
      _dispatchSelectFields(selectedPnlFields);
      const newValue = await _getPnlFieldsSelected();
      expect(newValue).toBe(selectedPnlFields);
    });
  });

  describe('pnlFilterValue$', () => {
    it('should select the pnlFilterValue', async () => {
      const initialValue = await _getFilterValue();
      expect(initialValue).toBe(pnlFiltersInitialState.filterValue);
      _dispatchSetPnlFilter(pnlFilter);
      const newValue = await _getFilterValue();
      expect(newValue).toBe(pnlFilter);
    });
  });

  describe('removePnlField()', () => {
    it('should dispatch the RemoveField action', () => {
      spyOn(store, 'dispatch').and.callThrough();
      const id = 1034;
      const expectedAction = RemoveField({ id });
      facade.removePnlField({ id });
      expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });
  });

  describe('selectPnlFields()', () => {
    it('should dispatch the SelectFields action', () => {
      spyOn(store, 'dispatch').and.callThrough();
      const expectedAction = SelectFields({ ids: selectedPnlFields });
      facade.selectPnlFields({ ids: selectedPnlFields });
      expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });
  });

  describe('setPnlFilter()', () => {
    it('should dispatch the setPnlFilter action', () => {
      spyOn(store, 'dispatch').and.callThrough();
      const expectedAction = SetPnlFilterFromUi({ payload: pnlFilter });
      facade.setPnlFilter(pnlFilter);
      expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });
  });

  function _dispatchSelectFields(ids: number[]): void {
    store.dispatch(SelectFields({ ids }));
  }

  function _dispatchSetPnlFilter(filter: PnlFilter): void {
    store.dispatch(SetPnlFilter({ payload: filter}));
  }

  async function _getPnlFieldsSelected(): Promise<number[]> {
    return facade.pnlFieldsSelected$.pipe(take(1)).toPromise();
  }

  async function _getFilterValue(): Promise<PnlFilter> {
    return facade.pnlFilterValue$.pipe(take(1)).toPromise();
  }
});
