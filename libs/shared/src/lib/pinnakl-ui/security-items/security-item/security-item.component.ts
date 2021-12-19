import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { SecurityItem } from '../security-item.model';
import { addAlpha, getCurrentSymbol } from '../security-item.util';

@Component({
  selector: 'pnkl-security-item',
  templateUrl: './security-item.component.html',
  styleUrls: ['./security-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SecurityItemComponent {
  getCurrentSymbol = getCurrentSymbol;
  addAlpha = addAlpha;

  @Input() dataItem: SecurityItem;
  @Input() searchText = '';

  @Output() itemSelected = new EventEmitter<SecurityItem>();

  itemClickHandler(item: SecurityItem): void {
    this.itemSelected.emit(item);
  }

}
