import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RecommendedAction } from '../../../dashboard-backend/recommended-actions/recommended-action.model';

@Component({
  selector: 'recommended-action',
  templateUrl: './recommended-action.component.html',
  styleUrls: ['./recommended-action.component.scss']
})
export class RecommendedActionComponent {
  @Input() action: RecommendedAction;
  @Output() onActionClicked = new EventEmitter<RecommendedAction>();
  @Output() onActionSupress = new EventEmitter<RecommendedAction>();
}
