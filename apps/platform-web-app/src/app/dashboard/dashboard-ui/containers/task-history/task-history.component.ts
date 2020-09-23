import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GridOptions } from 'ag-grid-community';
import * as _ from 'lodash';
import * as moment from 'moment';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import { WebServiceProvider } from '@pnkl-frontend/core';
import { ClientConnectivity } from '@pnkl-frontend/shared';
import { ClientFile } from '@pnkl-frontend/shared';
import { FileService } from '@pnkl-frontend/shared';
import { TaskHistoryService } from '../../../dashboard-backend';
import { Utility } from '@pnkl-frontend/shared';
import { TaskHistoryParam } from './task-history-param.model';

@Component({
  selector: 'task-history',
  templateUrl: './task-history.component.html',
  styleUrls: ['./task-history.component.scss'],
  animations: [
    trigger('tasksVisibleChanged', [
      state('1', style({ transform: 'translateX(-257%)' })),
      state('0', style({ transform: 'translateX(0)' })),
      transition('* => *', animate('500ms'))
    ])
  ]
})
export class TaskHistoryComponent implements OnInit {
  @Input() taskHistoryVisible = false;
  @Output() loadTaskDetails = new EventEmitter();
  @Input() taskId: string;
  @Input() entities: ClientConnectivity[];
  @Output() onCloseTaskHistory: EventEmitter<any> = new EventEmitter<any>();
  gridOptions: GridOptions;
  form: FormGroup;
  rowData: any[];
  columnDefs: any[] = [];
  startDate: Date = new Date(
    moment()
      .subtract(14, 'days')
      .format('MM/DD/YYYY')
  );
  endDate: Date = new Date(moment().format('MM/DD/YYYY'));
  inputParams: TaskHistoryParam[] = [];
  outputParams: TaskHistoryParam[] = [];
  clientFiles: ClientFile[] = [];
  failureParams = '';
  submitted = false;
  private taskHistoryWithDynamicColumns: any[] = [];
  constructor(
    private spinner: PinnaklSpinner,
    private wsp: WebServiceProvider,
    private fb: FormBuilder,
    private fileService: FileService,
    private taskHistoryService: TaskHistoryService,
    private utility: Utility
  ) {
    this.gridOptions = {};
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.taskId && changes.taskId.currentValue) {
      this.taskId = changes.taskId.currentValue;
      this.ngOnInit();
    }
  }

  ngOnInit() {
    this.form = this.fb.group({
      startDate: [this.startDate, Validators.required],
      endDate: [this.endDate, Validators.required]
    });
    this.taskId && this.getTaskHistory();
  }

  closeTaskHistory(): void {
    this.onCloseTaskHistory.emit();
    this.openTaskDetails();
  }

  getTaskHistory(): void {
    this.spinner.spin();
    this.taskHistoryService
      .getTaskHistory(this.form.value.startDate, this.taskId)
      .then(taskHistory => {
        this.spinner.stop();
        this.taskHistoryWithDynamicColumns = taskHistory.map(x => x);
        this.initializeGrid();
      })
      .catch(() => this.spinner.stop());
  }

  private doesTaskHistoryExists(): boolean {
    return this.taskHistoryWithDynamicColumns.length > 0;
  }

  private initializeGrid(): void {
    this.emptyTaskHistory();
    if (!this.doesTaskHistoryExists()) {
      return;
    }
    let columns = this.getColumns();
    let paramsToBeAddedInGridColumn = this.getTaskHistoryParams(
      this.taskHistoryWithDynamicColumns[0].params
    );
    if (paramsToBeAddedInGridColumn && paramsToBeAddedInGridColumn.length > 0) {
      paramsToBeAddedInGridColumn = this.getParamsWithActualName(
        paramsToBeAddedInGridColumn
      );
      paramsToBeAddedInGridColumn.forEach(param => {
        columns.push({
          field: param.name,
          headerName: this.getReadableProperty(param.name)
        });
      });

      this.taskHistoryWithDynamicColumns.forEach(
        taskHistoryDynamicColumnsJson => {
          let paramsToBeAddedInGridData = this.getTaskHistoryParams(
            taskHistoryDynamicColumnsJson.params
          );
          paramsToBeAddedInGridData = this.getParamsWithActualName(
            paramsToBeAddedInGridData
          );
          if (paramsToBeAddedInGridData) {
            paramsToBeAddedInGridData.forEach(param => {
              taskHistoryDynamicColumnsJson[param.name] = param.value;
            });
          }
        }
      );
    }
    this.columnDefs = columns;
    this.rowData = this.taskHistoryWithDynamicColumns;
    setTimeout(() => {
      this.gridOptions.api.sizeColumnsToFit();
    }, 10);
    // selecting first row of grid
    this.onRowClicked({ data: this.taskHistoryWithDynamicColumns[0] });
  }

  private emptyTaskHistory() {
    this.columnDefs = [];
    this.rowData = [];
    this.inputParams = [];
    this.outputParams = [];
    this.clientFiles = [];
  }

  private getColumns(): any[] {
    return [
      {
        headerName: 'Last Run Time',
        field: 'runtime',
        minWidth: 170,
        cellRenderer: field => {
          return moment(field.value).format('MM/DD/YYYY h:mm:ss A');
        }
      },
      {
        headerName: 'Run By',
        field: 'runby'
      },
      {
        headerName: 'Status',
        field: 'status'
      }
    ];
  }

  getReadableProperty(property: string): string {
    property = property.replace(/_/g, ' ');
    property = property.replace(
      /\w\S*/g,
      txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
    return property;
  }

  private getTaskHistoryParams(params: string): TaskHistoryParam[] {
    let commaSeparatedArr = [],
      colonSeparatedArr = [],
      taskHistoryParams = [];
    if (params) {
      if (params.indexOf(',') >= 0) {
        commaSeparatedArr = params.split(',');
        commaSeparatedArr.forEach(paramString => {
          paramString = paramString.trim();
          if (paramString.indexOf(':') >= 0) {
            colonSeparatedArr = paramString.split(':');
            taskHistoryParams.push(
              new TaskHistoryParam(
                colonSeparatedArr[0].trim(),
                colonSeparatedArr[1].trim()
              )
            );
          } else {
            taskHistoryParams.push(
              new TaskHistoryParam(paramString.trim(), '')
            );
          }
        });
      } else {
        if (params) {
          colonSeparatedArr = params.split(':');
          taskHistoryParams.push(
            new TaskHistoryParam(
              colonSeparatedArr[0].trim(),
              colonSeparatedArr[1].trim()
            )
          );
        } else {
          taskHistoryParams.push(new TaskHistoryParam(params.trim(), ''));
        }
      }
    }
    return taskHistoryParams;
  }

  private getParamsWithActualName(
    params: TaskHistoryParam[]
  ): TaskHistoryParam[] {
    let paramsWithActualName = params.map(x => x);
    paramsWithActualName.forEach(paramJson => {
      let param = paramsWithActualName.find(
        x => x.name.toLowerCase() === 'entityid'
      );
      if (!param) {
        return;
      }
      param.name = 'entity';
      let entityId = param.value;
      let entity: any = _.find(this.entities, ['id', parseInt(entityId)]);
      if (!entity) {
        return;
      }
      param.value = entity.entity;
    });
    return paramsWithActualName;
  }

  onRowClicked(event): void {
    let taskHistoryWithDynamicColumnsJson = event.data;
    this.getAndRenderClientFiles(taskHistoryWithDynamicColumnsJson);
  }

  private getAndRenderClientFiles(taskHistoryWithDynamicColumnsJson): void {
    this.spinner.spin();
    this.fileService
      .getMany({
        taskInstanceQueueId:
          taskHistoryWithDynamicColumnsJson.taskInstanceQueueId
      })
      .then(clientFiles => {
        this.spinner.stop();
        this.clientFiles = clientFiles;
        this.failureParams = undefined;
        let params = this.getTaskHistoryParams(
          taskHistoryWithDynamicColumnsJson.params
        );
        params = this.getParamsWithActualName(params);
        this.inputParams = params;
        if (taskHistoryWithDynamicColumnsJson.status === '1') {
          this.outputParams = this.getTaskHistoryParams(
            taskHistoryWithDynamicColumnsJson.successParams
          );
        } else if (taskHistoryWithDynamicColumnsJson.status === '0') {
          this.failureParams = taskHistoryWithDynamicColumnsJson.failureParams;
        }
      })
      .catch(() => this.spinner.stop());
  }

  downloadFile(file: ClientFile): void {
    this.spinner.spin();
    this.fileService
      .download(file.id)
      .then(() => this.spinner.stop())
      .catch(this.utility.errorHandler.bind(this));
  }

  openTaskDetails(): void {
    this.loadTaskDetails.emit();
  }
}
