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
  selector: 'available-config-columns',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './available-config-columns.component.html',
  styleUrls: ['./available-config-columns.component.scss']
})
export class AvailableConfigColumnsComponent {
  @Input() availableReportingColumn: ReportingColumn[] = [];
  @Input() importantColumnNames: string[] = [];

  @Output() columnsAdded = new EventEmitter<ReportingColumn[]>();

  pinnaklColumnsSearchText = '';

  get filteredSelectableColumns(): ReportingColumn[] {
    return !this.pinnaklColumnsSearchText
      ? this.availableReportingColumn
      : this.availableReportingColumn.filter(col =>
          col.caption
            .toLowerCase()
            .includes(this.pinnaklColumnsSearchText.toLowerCase())
        );
  }

  addAllColumns(): void {
    this.columnsAdded.emit(this.availableReportingColumn);
  }

  addColumn(column: ReportingColumn): void {
    this.columnsAdded.emit([column]);
  }

  isImportantColumn(column: ReportingColumn): boolean {
    return _.includes(this.importantColumnNames, column.name.toLowerCase());
  }
}
