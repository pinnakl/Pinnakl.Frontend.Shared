import { TestBed } from '@angular/core/testing';

import { BehaviorSubject } from 'rxjs';

import { BackendConnectionFacade } from '@pnkl-frontend/app-state';
import { RefreshOnReconnectService } from '@pnkl-frontend/core';
import { LOCATION } from '../location.injection-token';

const reconnectedAtSubject = new BehaviorSubject<Date>(null);
const mockBackendConnectionFacade: Partial<BackendConnectionFacade> = {
  reconnectedAt$: reconnectedAtSubject.asObservable()
};

let mockLocation: Location;
let service: RefreshOnReconnectService;

describe('RefreshOnReconnectService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RefreshOnReconnectService,
        {
          provide: BackendConnectionFacade,
          useValue: mockBackendConnectionFacade
        },
        {
          provide: LOCATION,
          useValue: jasmine.createSpyObj('location', ['reload'])
        }
      ]
    });
    mockLocation = TestBed.inject(LOCATION);
    service = TestBed.inject(RefreshOnReconnectService);
  });

  describe('disable()', () => {
    it('should stop reloading the page when reconnection occurs', () => {
      service.enable();
      reconnectedAtSubject.next(new Date());
      expect(mockLocation.reload).toHaveBeenCalledTimes(1);
      service.disable();
      reconnectedAtSubject.next(new Date());
      // 1 here refers to the previous call, so no new call aftfer disabling
      expect(mockLocation.reload).toHaveBeenCalledTimes(1);
    });
  });

  describe('enable()', () => {
    it('should enable reloading the page when reconnection occurs', () => {
      reconnectedAtSubject.next(new Date());
      expect(mockLocation.reload).toHaveBeenCalledTimes(0);
      service.enable();
      reconnectedAtSubject.next(new Date());
      reconnectedAtSubject.next(new Date());
      expect(mockLocation.reload).toHaveBeenCalledTimes(2);
    });
  });
});
