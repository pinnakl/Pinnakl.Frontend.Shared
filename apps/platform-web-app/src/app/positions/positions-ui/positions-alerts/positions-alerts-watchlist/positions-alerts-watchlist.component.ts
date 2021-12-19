import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import {
  PositionService,
  Security,
  WatchlistItem
} from '@pnkl-frontend/shared';
import { Observable } from 'rxjs';
import { PositionsBackendStateFacade } from '../../../positions-backend-state/positions-backend-state-facade.service';
import { PositionsUiStateFacade } from '../../../positions-ui-state/positions-ui-state-facade.service';

export enum FilterTypes {
  ACTIVE = 'Active',
  TRIGGERED = 'Triggered'
}

@Component({
  selector: 'positions-alerts-watchlist',
  templateUrl: './positions-alerts-watchlist.component.html',
  styleUrls: ['../positions-alerts.component.scss']
})
export class PositionsAlertsWatchlistComponent implements OnInit {
  @Output() toggleModal = new EventEmitter<any>();
  @Input() securities: Security[] = [];
  public securitiesOptions: Security[];
  public showAddToListModal = false;
  public watchlistItems$: Observable<WatchlistItem[]>;
  public filterTypes: typeof FilterTypes = FilterTypes;

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
    this.positionsBackendStateFacade.loadWatchListItems();
    this.watchlistItems$ = this.positionsUIStateFacade.mappedWatchlistData$;
  }

  public async deleteFromWatchlist(id: string): Promise<void> {
    try {
      await this.positionService.deleteFromWatchlist(id);
      this.positionsBackendStateFacade.loadWatchListItems();
    } catch (e) {
      console.log('error deleting watchlist item:', e);
    }
  }

  public openModal(): void {
    this.toggleModal.emit();
  }
}
