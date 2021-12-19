import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ClientConnectivity } from '@pnkl-frontend/shared';
import { TaskObject } from '../../../shared/task-object.model';

@Component({
  selector: 'task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.scss']
})
export class TaskDetailsComponent {
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

  openTaskHistory(): void {
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
    const operationChanged = this.selectedOperation !== operation,
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

  closeTaskSlider(): void {
    this.closeTasks.emit();
  }
}
