import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { Observable } from 'rxjs';
import { filter, map, take, tap } from 'rxjs/operators';

import {
  PositionsPnlDataField,
  PositionsPnlDataFieldsBackendStateFacade,
  UserScreenSettingsBackendStateFacade
} from '@pnkl-frontend/shared';
import { PnlUiStateFacadeService } from '../pnl-ui-state-facade.service';

@Injectable()
export class PnlFieldsSelectedGuard implements CanActivate {
  constructor(
    private readonly _positionsPnlDataFieldsBackendStateFacade: PositionsPnlDataFieldsBackendStateFacade,
    private readonly _pnlUiStateFacade: PnlUiStateFacadeService,
    private readonly _userScreenSettingsBackendStateFacade: UserScreenSettingsBackendStateFacade
  ) { }

  canActivate(): Observable<boolean> {
    return this._pnlFieldsSelected();
  }

  private async _getAllPnlFields(): Promise<PositionsPnlDataField[]> {
    return this._positionsPnlDataFieldsBackendStateFacade.positionsPnlDataFields$
      .pipe(take(1))
      .toPromise();
  }

  private _pnlFieldsSelected(): Observable<boolean> {
    return this._pnlUiStateFacade.pnlFieldsSelected$.pipe(
      tap(ids => {
        if (ids) {
          return;
        }
        this._selectPnlFields();
      }),
      filter(ids => !!ids),
      take(1),
      map(ids => !!ids)
    );
  }

  private async _selectPnlFields(): Promise<void> {
    const userSettingsSelected = await this._selectUserSettingsPnlFields();
    if (userSettingsSelected) {
      return;
    }
    this._selectDefaultPnlFields();
  }

  private _selectDefaultPnlFields(): void {
    this._positionsPnlDataFieldsBackendStateFacade.positionsPnlDataFieldsLoaded$
      .pipe(
        filter(loaded => loaded),
        take(1)
      )
      .subscribe(async () => {
        const allPnlFields = await this._getAllPnlFields();
        const selectedFields: number[] = [];
        selectField(allPnlFields, selectedFields, 'sector', 'security');
        selectField(allPnlFields, selectedFields, 'assettype', 'security');
        selectField(allPnlFields, selectedFields, 'strategy', 'attribute');
        selectField(allPnlFields, selectedFields, 'analyst', 'attribute');
        this._pnlUiStateFacade.selectPnlFields({ ids: selectedFields });
        this._pnlUiStateFacade.selectInitialPnlFields({ ids: selectedFields });
      });
  }

  private async _selectUserSettingsPnlFields(): Promise<boolean> {
    await this._userScreenSettingsBackendStateFacade.loaded$
      .pipe(
        filter(loaded => loaded),
        take(1)
      )
      .toPromise();
    const setting = this._userScreenSettingsBackendStateFacade.getUserScreenSetting(
      {
        screen: 'PnL Dashboard',
        setting: 'Widget Ids'
      }
    );
    if (!setting) {
      return false;
    }
    this._pnlUiStateFacade.selectPnlFields({
      ids: setting.settingValue as number[]
    });
    this._pnlUiStateFacade.selectInitialPnlFields({
      ids: setting.settingValue as number[]
    });
    return true;
  }
}

function selectField(
  allPnlFields: PositionsPnlDataField[],
  selectedFields: number[],
  fieldName: string,
  fieldType: 'security' | 'attribute'
): void {
  const sectorField = allPnlFields.find(
    f => f.name.toLowerCase() === fieldName && f.type === fieldType
  );
  if (sectorField) {
    selectedFields.push(sectorField.id);
  }
}
