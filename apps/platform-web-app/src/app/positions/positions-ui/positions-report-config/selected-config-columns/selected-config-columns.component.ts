import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import * as _ from 'lodash';

import { ReportingColumn } from '@pnkl-frontend/shared';

@Component({
  selector: 'selected-config-columns',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './selected-config-columns.component.html'
})
export class SelectedConfigColumnsComponent {
  @Input() height = 340;
  @Input() importantColumnNames: string[] = [];
  @Input() selectedColumns: ReportingColumn[] = [];

  @Output() columnsRemoved = new EventEmitter<ReportingColumn[]>();

  confirmationVisible = false;
  importantColumnToAdd: ReportingColumn;

  isImportantColumn(column: ReportingColumn): boolean {
    return _.includes(this.importantColumnNames, column.name.toLowerCase());
  }

  removeAllColumns(): void {
    this.columnsRemoved.emit(this.selectedColumns);
  }

  removeColumn(column: ReportingColumn): void {
    if (this.isImportantColumn(column)) {
      this.confirmationVisible = true;
      this.importantColumnToAdd = column;
      return;
    }

    this.columnsRemoved.emit([column]);
  }

  removeImportantColumn(): void {
    this.columnsRemoved.emit([this.importantColumnToAdd]);
    this.importantColumnToAdd = null;
  }
}
