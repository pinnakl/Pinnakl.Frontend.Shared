import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

import { orderBy } from 'lodash';

import { AlertModel } from '../../../dashboard-backend/dashboard';
@Component({
  selector: 'alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss']
})
export class AlertsComponent implements OnChanges {
  constructor() {}
  @Input() alerts: AlertModel[];
  @Output() removeAlert = new EventEmitter<number>();

  ngOnChanges(changes: SimpleChanges): void {
    this.alerts = orderBy(changes.alerts.currentValue, ['date'], ['desc']);
  }
}
