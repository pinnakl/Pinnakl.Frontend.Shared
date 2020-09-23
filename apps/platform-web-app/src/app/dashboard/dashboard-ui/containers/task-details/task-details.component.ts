import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClientConnectivity } from '@pnkl-frontend/shared';
import { TaskObject } from '../../../shared/task-object.model';

@Component({
  selector: 'task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.scss'],
  animations: [
    trigger('tasksVisibleChanged', [
      state('1', style({ transform: 'translateX(-99%)' })),
      state('0', style({ transform: 'translateX(0)' })),
      transition('* => *', animate('500ms'))
    ])
  ]
})
export class TaskDetailsComponent implements OnInit {
  @Input() tasksVisible = false;
  @Output() loadTaskHistory = new EventEmitter();
  @Output() closeTasks = new EventEmitter();
  @Output() setSelectedTask = new EventEmitter();
  categories = [
    {
      name: 'operations',
      active: true
    },
    {
      name: 'trading',
      active: false
    },
    {
      name: 'accounting',
      active: false
    },
    {
      name: 'compliance',
      active: false
    }
  ];
  @Input() entities: ClientConnectivity[];
  selectedCategory = this.categories[0];
  selectedOperation = 'summary';
  selectedTask: TaskObject;
  showTaskHistory = false;
  showTaskManager = false;
  @Input() tasks: TaskObject[];
  constructor(private activatedRoute: ActivatedRoute) {
    // Object.assign(this, this.activatedRoute.snapshot.data.resolvedData);
  }

  ngOnInit() {}

  openTaskHistory() {
    this.loadTaskHistory.emit(); // TODO: also send the details of the task selected
  }

  operationSelected(task: TaskObject, operation: string): void {
    if (!this.selectedTask) {
      this.selectedTask = task;
      this.selectedOperation = operation;
      if (operation === 'history') {
        this.showTaskHistory = true;
        this.setSelectedTask.emit(this.selectedTask);
        this.openTaskHistory();
      }
      this.showTaskManager = true;
      return;
    }
    let operationChanged = this.selectedOperation !== operation,
      taskChanged = this.selectedTask.id !== task.id,
      openTaskHistory = () => {
        if (operation === 'history') {
          this.showTaskHistory = true;
          this.setSelectedTask.emit(this.selectedTask);
          this.openTaskHistory();
          this.showTaskManager = false;
        } else {
          this.showTaskManager = true;
        }
      };
    if (!operationChanged && !taskChanged) {
      if (operation === 'history') {
        this.showTaskHistory = true;
        this.setSelectedTask.emit(this.selectedTask);
        this.openTaskHistory();
        this.showTaskManager = false;
      } else {
        this.showTaskManager = !this.showTaskManager;
      }
    } else if (!operationChanged && taskChanged) {
      this.selectedTask = task;
      openTaskHistory();
    } else if (operationChanged && !taskChanged) {
      this.selectedOperation = operation;
      openTaskHistory();
    } else {
      this.selectedOperation = operation;
      this.selectedTask = task;
      openTaskHistory();
    }
  }

  getCategoryTasks(): TaskObject[] {
    return this.tasks.filter(task =>
      task.category
        .toUpperCase()
        .includes(this.selectedCategory.name.toUpperCase())
    );
  }

  closeTaskSlider() {
    this.closeTasks.emit();
  }
}
