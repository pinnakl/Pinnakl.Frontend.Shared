import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { concatMap } from 'rxjs/operators';

import { IdcColumn, IdcColumnsService } from '@pnkl-frontend/shared';
import {
  AttemptLoadIdcColumns,
  LoadIdcColumns,
  LoadIdcColumnsFailed
} from './idc-column.actions';

@Injectable()
export class IdcColumnEffects {
  load$ = createEffect(() => this.actions$.pipe(
    ofType(AttemptLoadIdcColumns),
    concatMap(() =>
      this.idcColumnService
        .getIdcColumns()
        .then((idcColumns: IdcColumn[]) => LoadIdcColumns({ idcColumns }))
        .catch(error => LoadIdcColumnsFailed({ error }))
    )
  ));

  constructor(
    private actions$: Actions,
    private idcColumnService: IdcColumnsService
  ) { }
}
