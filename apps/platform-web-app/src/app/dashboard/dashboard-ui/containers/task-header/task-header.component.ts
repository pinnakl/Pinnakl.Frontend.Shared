import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TaskObject } from '../../../shared/task-object.model';

import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'task-header',
  templateUrl: './task-header.component.html',
  styleUrls: ['./task-header.component.scss'],
  animations: [
    trigger('lastRunDetailChanged', [
      transition('* => *', [
        style({ opacity: 0 }),
        animate(1000, style({ opacity: 1 }))
      ])
    ])
  ]
})
export class TaskHeaderComponent {
  @Output() operationSelected = new EventEmitter<string>();
  @Input() task: TaskObject;

  openSummary(): void {
    this.operationSelected.emit('summary');
  }

  switchTab(event: Event, tabName: string): void {
    // tabName will be run when we click on play button
    event.stopPropagation();
    this.operationSelected.emit(tabName);
  }
}
