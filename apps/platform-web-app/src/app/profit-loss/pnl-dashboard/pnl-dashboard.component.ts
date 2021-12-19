import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

import {
  Account,
  AccountsBackendStateFacade,
  PositionsPnlDataField,
  PositionsPnlDataFieldsBackendStateFacade,
  UserScreenSettingsBackendStateFacade
} from '@pnkl-frontend/shared';
import { PnlFilter } from '../shared/pnl-backend/pnl-calculated/pnl-calculated-filter.model';
import { PnlDashboardWidget } from '../shared/pnl-ui-state/models/pnl-dashboard-widget.model';
import { PnlUiStateFacadeService } from '../shared/pnl-ui-state/pnl-ui-state-facade.service';
import { HideFilter, selectPnlFilterVisible } from '../shared/pnl-ui-state/store';

@Component({
  selector: 'pnl-dashboard',
  templateUrl: 'pnl-dashboard.component.html',
  styleUrls: ['pnl-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PnlDashboardComponent implements OnInit, OnDestroy {
  accounts$: Observable<Account[]>;
  filterVisible$: Observable<boolean>;
  pnlDashboardWidgets$: Observable<PnlDashboardWidget[]>;
  pnlFields$: Observable<PositionsPnlDataField[]>;
  pnlFilterValue$: Observable<PnlFilter>;
  selectedPnlFields$: Observable<number[]>;

  constructor(
    private readonly _accountsBackendStateFacade: AccountsBackendStateFacade,
    private readonly _positionsPnlDataFieldsBackendStateFacade: PositionsPnlDataFieldsBackendStateFacade,
    public _pnlUiStateFacade: PnlUiStateFacadeService,
    private readonly _userScreenSettingsBackendStateFacade: UserScreenSettingsBackendStateFacade,
    private readonly store: Store<any>
  ) {}

  applyFilter(filterData: PnlFilter): void {
    this._pnlUiStateFacade.setPnlFilter(filterData);
    this.hideFilter();
  }

  hideFilter(): void {
    this.store.dispatch(HideFilter());
  }

  closeWidget(fieldId: number): void {
    this._pnlUiStateFacade.removePnlField({ id: fieldId });
  }

  ngOnDestroy(): void {
    this.hideFilter();
  }

  ngOnInit(): void {
    this.accounts$ = this._accountsBackendStateFacade.accounts$;
    this.filterVisible$ = this.store.pipe(select(selectPnlFilterVisible));
    this.pnlDashboardWidgets$ = this._pnlUiStateFacade.pnlDashboardWidgets$;
    this.pnlFields$ = this._positionsPnlDataFieldsBackendStateFacade.positionsPnlDataFields$;
    this.pnlFilterValue$ = this._pnlUiStateFacade.pnlFilterValue$;
    this.selectedPnlFields$ = this._pnlUiStateFacade.initialPnlFieldsSelected$;
  }

  onPnlFieldAdd(selectedPnlFields: number[]): void {
    this._pnlUiStateFacade.selectInitialPnlFields({ ids: selectedPnlFields });
  }

  saveWidgets(): void {
    const existingSetting = this._userScreenSettingsBackendStateFacade.getUserScreenSetting(
      {
        screen: 'PnL Dashboard',
        setting: 'Widget Ids'
      }
    );
    let currentSettings: number[];
    this.selectedPnlFields$.pipe(first()).subscribe(x => (currentSettings = x));
    if (existingSetting) {
      this._userScreenSettingsBackendStateFacade.put({
        id: existingSetting.id,
        screen: 'PnL Dashboard',
        setting: 'Widget Ids',
        settingValue: currentSettings
      });
    } else {
      this._userScreenSettingsBackendStateFacade.post({
        screen: 'PnL Dashboard',
        setting: 'Widget Ids',
        settingValue: currentSettings
      });
    }
  }
}
