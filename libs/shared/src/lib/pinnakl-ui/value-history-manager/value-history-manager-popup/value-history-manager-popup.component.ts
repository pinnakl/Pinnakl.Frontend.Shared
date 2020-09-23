import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ValueHistoryItem } from '../value-history-item.model';

@Component({
  selector: 'value-history-manager-popup',
  templateUrl: './value-history-manager-popup.component.html',
  styleUrls: ['./value-history-manager-popup.component.scss']
})
export class ValueHistoryManagerPopupComponent {
  @Input() fetchHistoryItems: () => Promise<ValueHistoryItem[]>;
  @Input() saveAllHistoryItems: (x: {
    add: ValueHistoryItem[];
    delete: ValueHistoryItem[];
    update: ValueHistoryItem[];
  }) => Promise<void>;
  @Input() title = '';
  @Output() onClose = new EventEmitter<void>();
  @Output() onLatestValueChange = new EventEmitter<number>();
}
