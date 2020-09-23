import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { ValueHistoryItem } from '../value-history-item.model';
import { ValueHistoryManagerService } from '../value-history-manager.service';

@Component({
  selector: 'value-history-manager',
  templateUrl: './value-history-manager.component.html',
  styleUrls: ['./value-history-manager.component.scss']
})
export class ValueHistoryManagerComponent implements OnInit {
  @Input() title = '';

  @Input() private fetchHistoryItems: () => Promise<ValueHistoryItem[]>;
  @Input() private saveAllHistoryItems: (x: {
    add: ValueHistoryItem[];
    delete: ValueHistoryItem[];
    update: ValueHistoryItem[];
  }) => Promise<void>;
  @Output() onLatestValueChange = new EventEmitter<number>();

  constructor(public valueHistoryManagerService: ValueHistoryManagerService) {}

  async ngOnInit(): Promise<void> {
    await this.loadHistory();
  }

  onDelete(valueHistoryItem: ValueHistoryItem): void {
    this.valueHistoryManagerService.deleteHistoryItem(valueHistoryItem);
  }

  onEdit(valueHistoryItem: ValueHistoryItem): void {
    this.valueHistoryManagerService.editHistoryItem(valueHistoryItem);
  }

  onSave(valueHistoryItem: ValueHistoryItem): void {
    this.valueHistoryManagerService.addHistoryItem(valueHistoryItem);
  }

  async saveAll(): Promise<void> {
    await this.valueHistoryManagerService.saveAllHistoryItems(
      this.fetchHistoryItems,
      this.saveAllHistoryItems
    );
    this.onLatestValueChange.emit(
      this.valueHistoryManagerService.getCurrentHistoryValue()
    );
  }

  private async loadHistory(): Promise<void> {
    await this.valueHistoryManagerService.loadHistory(this.fetchHistoryItems);
  }
}
