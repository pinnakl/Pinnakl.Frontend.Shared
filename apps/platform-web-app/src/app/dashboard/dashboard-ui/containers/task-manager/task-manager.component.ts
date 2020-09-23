import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ClientConnectivity } from '@pnkl-frontend/shared';
import { TaskObject } from '../../../shared/task-object.model';

@Component({
  selector: 'task-manager',
  templateUrl: './task-manager.component.html',
  styleUrls: ['./task-manager.component.scss'],
  animations: [
    trigger('panelVisible', [
      state('1', style({ height: '10vh' })),
      state('0', style({ height: 0, overflow: 'hidden' })),
      transition('1 => 0', animate('500ms ease-out')),
      transition('0 => 1', animate('500ms ease-out'))
    ]),
    trigger('listOfPropsChanged', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate(1000, style({ opacity: 1 }))
      ])
    ])
  ]
})
export class TaskManagerComponent implements OnInit {
  @Input() entities: ClientConnectivity[];
  @Input() operation: string;
  @Input() task: TaskObject;
  @Output() taskRunCompleted = new EventEmitter<void>();
  @Input() visible: boolean;
  constructor() {}

  ngOnInit() {}
}
