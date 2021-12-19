import { TestBed } from '@angular/core/testing';

import { StoreModule } from '@ngrx/store';

import { AumBackendStateFacade } from './aum-backend-state-facade.service';
import { reducers } from './store';

describe('AumBackendStateFacade', () => {
  let service: AumBackendStateFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        StoreModule.forFeature('aumBackend', reducers)
      ],
      providers: [AumBackendStateFacade]
    });
    service = TestBed.inject(AumBackendStateFacade);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
