import { Component, Input } from '@angular/core';
import { PnlExposure } from '../../../dashboard-backend/dashboard/pnl-exposure.model';
@Component({
  selector: 'pnl-by-category',
  templateUrl: './pnl-by-category.component.html',
  styleUrls: ['./pnl-by-category.component.scss']
})
export class PnlByCategoryComponent {
  @Input() pnlData: PnlExposure[];
  @Input() category: string;

  absoluteValue(number: number): number {
    return Math.abs(number);
  }
}
