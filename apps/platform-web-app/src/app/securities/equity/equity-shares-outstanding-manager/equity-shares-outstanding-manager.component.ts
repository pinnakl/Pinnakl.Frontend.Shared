import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ValueHistoryItem } from '@pnkl-frontend/shared';
import { EquitySharesOutstanding } from '@pnkl-frontend/shared';
import { EquitySharesOutstandingService } from '@pnkl-frontend/shared';

@Component({
  selector: 'equity-shares-outstanding-manager',
  templateUrl: './equity-shares-outstanding-manager.component.html',
  styleUrls: ['./equity-shares-outstanding-manager.component.scss']
})
export class EquitySharesOutstandingManagerComponent {
  @Input() equityId: number;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSharesOutstandingChange = new EventEmitter<number>();

  constructor(
    private equitySharesOutstandingService: EquitySharesOutstandingService
  ) {
    this.getSharesOutstanding = this.getSharesOutstanding.bind(this);
    this.saveSharesOutstanding = this.saveSharesOutstanding.bind(this);
  }

  async getSharesOutstanding(): Promise<ValueHistoryItem[]> {
    const couponRates = await this.equitySharesOutstandingService.get(
      this.equityId
    );
    return couponRates.map(({ sharesOutstanding, ...rest }) => ({
      ...rest,
      value: sharesOutstanding
    }));
  }

  async saveSharesOutstanding(toSave: {
    add: ValueHistoryItem[];
    delete: ValueHistoryItem[];
    update: ValueHistoryItem[];
  }): Promise<void> {
    const transform = ({
      value,
      ...rest
    }: ValueHistoryItem): EquitySharesOutstanding => <EquitySharesOutstanding>{
        ...rest,
        sharesOutstanding: value
      };
    await this.equitySharesOutstandingService.saveMany({
      add: toSave.add.map(x => ({ ...transform(x), equityId: this.equityId })),
      delete: toSave.delete.map(transform),
      update: toSave.update.map(transform)
    });
  }
}
