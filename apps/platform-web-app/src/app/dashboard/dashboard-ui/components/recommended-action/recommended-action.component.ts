import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RecommendedAction } from '../../../dashboard-backend';

@Component({
  selector: 'recommended-action',
  templateUrl: './recommended-action.component.html',
  styleUrls: ['./recommended-action.component.scss']
})
export class RecommendedActionComponent implements OnInit {
  @Input() action: RecommendedAction;
  @Output() onActionClicked = new EventEmitter<RecommendedAction>();
  @Output() onActionSupress = new EventEmitter<RecommendedAction>();

  constructor() {}

  ngOnInit(): void {}
}
