import { TestBed } from '@angular/core/testing';

import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { first } from 'rxjs/operators';

import { PinnaklSpinner, Toastr } from '@pnkl-frontend/core';
import { Utility } from '@pnkl-frontend/shared';
import { LoadUserReportColumns } from '../../../positions-backend-state/store/user-report-column/user-report-column.actions';
import { LoadUserReportCustomAttributes } from '../../../positions-backend-state/store/user-report-custom-attribute-column/user-report-custom-attribute.actions';
import { LoadUserReportIdcColumns } from '../../../positions-backend-state/store/user-report-idc-column/user-report-idc-column.actions';
import { PositionsReportSaveHelper } from './positions-report-save-helper.service';
import {
  AttemptSavePositionsReport,
  SavePositionsReport,
  SavePositionsReportFailed
} from './positions-report-save-manager.actions';
import { PositionsReportSaveManagerEffects } from './positions-report-save-manager.effects';

describe('PositionsReportSaveManagerEffects', () => {
  let actions$: Observable<any>;
  let effects: PositionsReportSaveManagerEffects;
  let service: PositionsReportSaveHelper;
  let spinner: PinnaklSpinner;
  let toastr: Toastr;
  let utility: Utility;

  const error = 'Unexpected error';
  const payloadAttemptSave = {
    clientReportColumns: [],
    reportId: 77,
    selectedColumns: [],
    userReportColumns: [],
    userReportIdcColumns: [],
    userReportCustomAttributes: []
  };
  const payloadSave = {
    userReportColumns: [],
    userReportIdcColumns: [],
    userReportCustomAttributes: []
  };
  const positionsReportSaveHelperMock = {
    save(): void {}
  };

  beforeEach(() => {
    spinner = jasmine.createSpyObj('spinner', ['spin', 'stop']);
    toastr = jasmine.createSpyObj('toastr', ['success', 'error']);
    utility = jasmine.createSpyObj('utility', ['showError']);
    TestBed.configureTestingModule({
      providers: [
        PositionsReportSaveManagerEffects,
        provideMockActions(() => actions$),
        {
          provide: PinnaklSpinner,
          useValue: spinner
        },
        {
          provide: PositionsReportSaveHelper,
          useValue: positionsReportSaveHelperMock
        },
        {
          provide: Toastr,
          useValue: toastr
        },
        {
          provide: Utility,
          useValue: utility
        }
      ]
    });
    effects = TestBed.inject(PositionsReportSaveManagerEffects);
    service = TestBed.inject(PositionsReportSaveHelper);
  });

  describe('attemptSave$', () => {
    it('should dispach a success action', async () => {
      spyOn(service, 'save').and.returnValue(Promise.resolve(payloadSave));
      actions$ = of(new AttemptSavePositionsReport(payloadAttemptSave));
      const completion = await effects.attemptSave$.pipe(first()).toPromise();
      expect(spinner.spin).toHaveBeenCalled();
      expect(service.save).toHaveBeenCalledWith(payloadAttemptSave);
      expect(spinner.stop).toHaveBeenCalled();
      expect(toastr.success).toHaveBeenCalledWith(
        'Positions report saved successfully'
      );
      expect(completion).toEqual(new SavePositionsReport(payloadSave));
    });
    it('should dispach a fail action', async () => {
      spyOn(service, 'save').and.returnValue(Promise.reject(error));
      actions$ = of(new AttemptSavePositionsReport(payloadAttemptSave));
      const completion = await effects.attemptSave$.pipe(first()).toPromise();
      expect(spinner.spin).toHaveBeenCalled();
      expect(service.save).toHaveBeenCalledWith(payloadAttemptSave);
      expect(utility.showError).toHaveBeenCalledWith(error as any);
      expect(completion).toEqual(new SavePositionsReportFailed({ error }));
    });
  });

  // describe('save$', () => {
  //   it('should dispach 3 load user report actions', done => {
  //     actions$ = of(new SavePositionsReport(payloadSave));
  //     const results = [];
  //     effects.save$.subscribe(
  //       action => results.push(action),
  //       () => {},
  //       () => {
  //         expect(results).toEqual([
  //           new LoadUserReportColumns({ userReportColumns: [] }),
  //           new LoadUserReportCustomAttributes({
  //             userReportCustomAttributes: []
  //           }),
  //           new LoadUserReportIdcColumns({ userReportIdcColumns: [] })
  //         ]);
  //         done();
  //       }
  //     );
  //   });
  // });
});
