import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { SecurityMarketFlattened } from '../../models/security/security-market-flattened.model';
import { addAlpha, getCurrentSymbol, mapSecuritiesData } from './security-item.util';

export interface SecurityItem extends SecurityMarketFlattened {
  color: string;
  searchString: string;
}

@Component({
  selector: 'pnkl-security-items',
  templateUrl: './security-items.component.html',
  styleUrls: ['./security-items.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SecurityItemsComponent {
  getCurrentSymbol = getCurrentSymbol;
  addAlpha = addAlpha;

  private _items: SecurityItem[];
  @Input() set items(v: SecurityMarketFlattened[]) {
    this._items = mapSecuritiesData(v);
  }
  get items() {
    return this._items;
  }

  @Input() searchText = '';

  @Output() itemClicked = new EventEmitter<SecurityItem>();

  itemSelected(item: SecurityItem): void {
    this.itemClicked.emit(item);
  }
}
