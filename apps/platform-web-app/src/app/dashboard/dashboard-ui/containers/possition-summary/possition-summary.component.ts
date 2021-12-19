import { Component, Input } from '@angular/core';
import { PositionEventModel } from '../../../dashboard-backend/dashboard/position-event.model';

@Component({
  selector: 'possition-summary',
  templateUrl: './possition-summary.component.html',
  styleUrls: ['./possition-summary.component.scss']
})
export class PossitionSummaryComponent {
  @Input() positions: PositionEventModel[];
  @Input() type: string;
}
