import { TestBed } from '@angular/core/testing';

import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';

import { ReportParameter } from '@pnkl-frontend/shared';
import { LoadReportParameters } from '../../../positions-backend-state/store/report-parameter/report-parameter.actions';
import { LoadPositionsReportParameterValues } from './positions-report-parameter-value.actions';
import { PositionsReportParameterValueEffects } from './positions-report-parameter-value.effects';
import { PositionsReportParameterValue } from './positions-report-parameter-value.model';

const reportParameter: ReportParameter = {
  caption: 'As of Date',
  defaultValue: new Date('01/01/2001'),
  id: 5,
  name: 'AsOfDate',
  required: true,
  type: 'date',
  value: new Date('01/01/2001')
};
const positionsReportParameterValue: PositionsReportParameterValue = {
  id: 5,
  value: new Date('01/01/2001')
};

describe('PositionsReportParameterValueEffects', () => {
  let actions$: Observable<any>;
  let effects: PositionsReportParameterValueEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PositionsReportParameterValueEffects,
        provideMockActions(() => actions$)
      ]
    });
    effects = TestBed.inject(PositionsReportParameterValueEffects);
  });

  describe('load$', () => {
    it('should load the values for the provided parameters', async () => {
      actions$ = of(
        new LoadReportParameters({ reportParameters: [reportParameter] })
      );
      const result = await effects.load$.pipe(take(1)).toPromise();
      expect(result).toEqual(
        new LoadPositionsReportParameterValues({
          positionsReportParameterValues: [positionsReportParameterValue]
        })
      );
    });
  });
});
