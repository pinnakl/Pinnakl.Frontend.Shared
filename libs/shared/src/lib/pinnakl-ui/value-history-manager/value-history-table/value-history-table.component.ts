import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ValueHistoryItem } from '../value-history-item.model';

@Component({
  selector: 'value-history-table',
  templateUrl: './value-history-table.component.html',
  styleUrls: ['./value-history-table.component.scss']
})
export class ValueHistoryTableComponent {
  @Input() valueHistoryItems: ValueHistoryItem[] = [];
  @Output() onDelete = new EventEmitter<ValueHistoryItem>();
  @Output() onEdit = new EventEmitter<ValueHistoryItem>();
}
