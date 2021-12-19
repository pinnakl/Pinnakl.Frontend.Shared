import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { first, tap } from 'rxjs/operators';

import { PinnaklSpinner, Toastr } from '@pnkl-frontend/core';
import { Utility } from '../../../../services';
import {
  AddUserScreenSetting,
  AddUserScreenSettingFailed,
  AttemptAddUserScreenSetting,
  UpdateUserScreenSetting,
  UpdateUserScreenSettingFailed,
  UserScreenSettingActionTypes
} from './user-screen-setting.actions';

@Injectable()
export class UserScreenSettingUiEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly spinner: PinnaklSpinner,
    private readonly toastr: Toastr,
    private readonly utility: Utility
  ) { }

  add$ = createEffect(() => this.actions$.pipe(
    ofType(AttemptAddUserScreenSetting),
    tap(() => {
      this.spinner.spin();
      this.actions$
        .pipe(
          ofType(
            AddUserScreenSetting,
            AddUserScreenSettingFailed
          ),
          first()
        )
        .subscribe((v) => {
          if (v.type === UserScreenSettingActionTypes.AddUserScreenSetting) {
            this.spinner.stop();
            this.toastr.success('Saved successfully');
          } else {
            this.utility.showError((<any>v).error);
          }
        });
    })
  ), { dispatch: false });

  update$ = createEffect(() => this.actions$.pipe(
    ofType(UserScreenSettingActionTypes.AttemptUpdateUserScreenSettings),
    tap(() => {
      this.spinner.spin();
      this.actions$.pipe(
        ofType(UpdateUserScreenSetting, UpdateUserScreenSettingFailed),
        first()
      )
        .subscribe((v) => {
          if (v.type === UserScreenSettingActionTypes.UpdateUserScreenSetting) {
            this.spinner.stop();
            this.toastr.success('Saved successfully');
          } else {
            this.utility.showError((<any>v).error);
          }
        });
    })
  ), { dispatch: false });
}
