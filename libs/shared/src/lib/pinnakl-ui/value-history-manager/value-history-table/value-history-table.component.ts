import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { ValueHistoryItem } from '../value-history-item.model';

@Component({
  selector: 'value-history-table',
  templateUrl: './value-history-table.component.html',
  styleUrls: ['./value-history-table.component.scss']
})
export class ValueHistoryTableComponent implements OnInit {
  @Input() valueHistoryItems: ValueHistoryItem[] = [];
  @Output() onDelete = new EventEmitter<ValueHistoryItem>();
  @Output() onEdit = new EventEmitter<ValueHistoryItem>();
  constructor() {}

  ngOnInit(): void {}
}
