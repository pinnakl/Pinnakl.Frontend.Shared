import { TestBed } from '@angular/core/testing';

import { Store, StoreModule } from '@ngrx/store';
import { take } from 'rxjs/operators';

import { SetReconnectedAt } from './backend-connection.actions';
import { BackendConnectionFacade } from './backend-connection.facade';
import { initialState, reducer, State } from './backend-connection.reducer';

let facade: BackendConnectionFacade;
let store: Store<State>;

describe('BackendConnectionFacade', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        StoreModule.forFeature('backendConnection', reducer)
      ],
      providers: [BackendConnectionFacade]
    });
    facade = TestBed.inject(BackendConnectionFacade);
    store = TestBed.inject(Store);
  });

  describe('reconnectedAt$', () => {
    it('should select the value of reconnectedAt', async () => {
      const initialValueReconnectedAt = await _getReconnectedAtValue();
      expect(initialValueReconnectedAt).toBe(initialState.reconnectedAt);
      const currentDate = new Date();
      _dispatchSetReconnectedAt(currentDate);
      const newValueReconnectedAt = await _getReconnectedAtValue();
      expect(newValueReconnectedAt).toBe(currentDate);
    });
  });

  describe('setReconnectedAt()', () => {
    it('should dispatch the SetReconnectedAt action', () => {
      spyOn(store, 'dispatch').and.callThrough();
      const currentDate = new Date();
      const expectedAction = SetReconnectedAt({ reconnectedAt: currentDate });
      facade.setReconnectedAt(currentDate);
      expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });
  });
});

function _dispatchSetReconnectedAt(value: Date): void {
  store.dispatch(SetReconnectedAt({ reconnectedAt: value }));
}

async function _getReconnectedAtValue(): Promise<Date> {
  return facade.reconnectedAt$.pipe(take(1)).toPromise();
}
