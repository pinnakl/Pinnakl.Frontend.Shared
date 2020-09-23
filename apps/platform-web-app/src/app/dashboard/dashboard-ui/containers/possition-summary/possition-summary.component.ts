import { Component, Input } from '@angular/core';
import { PositionEventModel } from '../../../dashboard-backend/dashboard';
@Component({
  selector: 'possition-summary',
  templateUrl: './possition-summary.component.html',
  styleUrls: ['./possition-summary.component.scss']
})
export class PossitionSummaryComponent {
  @Input() positions: PositionEventModel[];
  @Input() type: string;
  constructor() {}
}
