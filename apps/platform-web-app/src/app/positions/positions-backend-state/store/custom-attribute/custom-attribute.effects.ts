import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap } from 'rxjs/operators';

import {
  CustomAttribute,
  CustomAttributeFeature,
  CustomAttributesService
} from '@pnkl-frontend/shared';
import {
  CustomAttributeActionTypes,
  LoadCustomAttributes,
  LoadCustomAttributesFailed
} from './custom-attribute.actions';

@Injectable()
export class CustomAttributeEffects {
  load$ = createEffect(() => this.actions$.pipe(
    ofType(CustomAttributeActionTypes.AttemptLoadCustomAttributes),
    concatMap(() =>
      this.customAttributeService
        .getCustomAttributes(CustomAttributeFeature.SECURITY)
        .then(
          (customAttributes: CustomAttribute[]) =>
            LoadCustomAttributes({ customAttributes: customAttributes.map(x => ({ ...x })) })
        )
        .catch(error => LoadCustomAttributesFailed({ error }))
    )
  ));

  constructor(
    private readonly actions$: Actions,
    private readonly customAttributeService: CustomAttributesService
  ) { }
}
