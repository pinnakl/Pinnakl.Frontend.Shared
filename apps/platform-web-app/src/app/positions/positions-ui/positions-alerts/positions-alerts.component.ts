import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';

import {
  PositionService,
  Security,
  SecurityPriceAlert
} from '@pnkl-frontend/shared';
import { Observable } from 'rxjs';
import { PositionsBackendStateFacade } from '../../positions-backend-state/positions-backend-state-facade.service';
import { PositionsUiStateFacade } from '../../positions-ui-state/positions-ui-state-facade.service';

export enum FilterTypes {
  ACTIVE = 'Active',
  TRIGGERED = 'Triggered'
}

export enum ModalType {
  NEW_ALERT_MODAL = 'showNewAlertModal',
  ADD_TO_WATCHLIST_MODAL = 'showAddToListModal'
}

@Component({
  selector: 'positions-alerts',
  templateUrl: './positions-alerts.component.html',
  styleUrls: ['./positions-alerts.component.scss'],
  animations: [
    trigger('alertsVisibleChanged', [
      state('1', style({ transform: 'translateX(0px)', display: 'block' })),
      state('0', style({ transform: 'translateX(100%)', display: 'block' })),
      transition('* => *', animate('300ms'))
    ])
  ]
})
export class PositionsAlertsComponent implements OnInit {
  @Input() alertsVisible;
  @Input() securities: Security[] = [];
  public securitiesOptions: Security[];
  public showNewAlertModal = false;
  public showAddToListModal = false;
  public showModal = false;
  public alerts$: Observable<SecurityPriceAlert[]>;
  public filterType = FilterTypes.ACTIVE;
  public filterTypes: typeof FilterTypes = FilterTypes;
  public modalTypes: typeof ModalType = ModalType;

  constructor(
    private readonly positionsBackendStateFacade: PositionsBackendStateFacade,
    private readonly positionsUIStateFacade: PositionsUiStateFacade,
    private readonly positionService: PositionService
  ) {}

  ngOnInit(): void {
    this.securitiesOptions = this.securities.filter(
      sec =>
        sec.assetType === 'equity' ||
        (sec.assetType === 'option' && sec.maturity > new Date())
    );
    this.positionsBackendStateFacade.loadSecurityPriceAlerts();
    this.alerts$ = this.positionsUIStateFacade.mappedAlertsData$;
  }

  public getSecurityName(id: string): string {
    return this.securities.find(s => s.id === +id)?.description ?? '-';
  }

  public formatCondition(condition: string): string {
    if (!condition) {
      return '-';
    }
    return condition === '<=' ? 'Less or equal' : 'More or equal';
  }

  public filterAlerts(alert: SecurityPriceAlert): boolean {
    return alert && alert.status === this.filterType;
  }

  public allowDelete(alert: SecurityPriceAlert): boolean {
    return alert && alert.status === FilterTypes.ACTIVE;
  }

  public toggleFilter(type: FilterTypes): void {
    this.filterType = type;
  }

  public async deleteAlert(id: string): Promise<void> {
    try {
      await this.positionService.deleteAlert(id);
      this.positionsBackendStateFacade.loadSecurityPriceAlerts();
    } catch (e) {
      console.log('error deleting alert:', e);
    }
  }

  public toggleModal(type: ModalType): void {
    Object.values(ModalType)
      .filter(i => i !== type)
      .forEach(t => (this[t] = false));
    this[type] = true;
    this.showModal = !this.showModal;
  }
}
