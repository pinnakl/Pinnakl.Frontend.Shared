import { Injectable } from '@angular/core';

import { Actions, Effect, ofType } from '@ngrx/effects';
import { first, tap } from 'rxjs/operators';

import { PinnaklSpinner, Toastr } from '@pnkl-frontend/core';
import { Utility } from '../../../../services/utility.service';
import {
  AddUserScreenSetting,
  AddUserScreenSettingFailed,
  UpdateUserScreenSetting,
  UpdateUserScreenSettingFailed,
  UserScreenSettingActionTypes
} from './user-screen-setting.actions';

@Injectable()
export class UserScreenSettingUiEffects {
  constructor(
    private actions$: Actions,
    private spinner: PinnaklSpinner,
    private toastr: Toastr,
    private utility: Utility
  ) {}

  @Effect({ dispatch: false })
  add$ = this.actions$.pipe(
    ofType(UserScreenSettingActionTypes.AttemptAddUserScreenSettings),
    tap(() => {
      this.spinner.spin();
      this.actions$
        .pipe(
          ofType<AddUserScreenSetting | AddUserScreenSettingFailed>(
            UserScreenSettingActionTypes.AddUserScreenSetting,
            UserScreenSettingActionTypes.AddUserScreenSettingFailed
          ),
          first()
        )
        .subscribe(({ payload, type }) => {
          if (type === UserScreenSettingActionTypes.AddUserScreenSetting) {
            this.spinner.stop();
            this.toastr.success('Saved successfully');
          } else {
            this.utility.showError((<any>payload).error);
          }
        });
    })
  );

  @Effect({ dispatch: false })
  update$ = this.actions$.pipe(
    ofType(UserScreenSettingActionTypes.AttemptUpdateUserScreenSettings),
    tap(() => {
      this.spinner.spin();
      this.actions$
        .pipe(
          ofType<UpdateUserScreenSetting | UpdateUserScreenSettingFailed>(
            UserScreenSettingActionTypes.UpdateUserScreenSetting,
            UserScreenSettingActionTypes.UpdateUserScreenSettingFailed
          ),
          first()
        )
        .subscribe(({ payload, type }) => {
          if (type === UserScreenSettingActionTypes.UpdateUserScreenSetting) {
            this.spinner.stop();
            this.toastr.success('Saved successfully');
          } else {
            this.utility.showError((<any>payload).error);
          }
        });
    })
  );
}
