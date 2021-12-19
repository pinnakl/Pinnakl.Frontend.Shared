import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { cloneDeep, isEqual } from 'lodash';
import { Subscription } from 'rxjs';

import { Destroyable, ReportingColumn } from '@pnkl-frontend/shared';
import { delay, map, takeUntil } from 'rxjs/operators';
import { PositionHomeService } from '../../position-home/position-home.service';

@Component({
  selector: 'filter-column',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filter-column.component.html'
})
export class FilterColumnComponent extends Destroyable implements OnDestroy {
  @Input() set columnsList(value: (ReportingColumn & { dropdownOptions: string[] })[]) {
    if (isEqual(value, this.columns)) {
      return;
    }
    this.columns = cloneDeep(value);
    this.setForm();
  }

  @Input() suppressSelection = false;

  @Output() onColumnUpdate = new EventEmitter<Partial<ReportingColumn>[]>();

  columns: (ReportingColumn & { dropdownOptions: string[] })[];
  columnSubscriptions: Subscription[] = [];
  form: FormGroup;
  selectAllDefaultValue = true;
  selectAllSubscription: Subscription;
  selectedFilters: any;

  constructor(private readonly positionHomeService: PositionHomeService) {
    super();
    this.watchPresetChanges();
  }

  ngOnDestroy(): void {
    this.clearSubscriptions();
  }

  private watchPresetChanges(): void {
    this.positionHomeService.pmsSelectedGridPresetConfig$
      .pipe(takeUntil(this.unsubscribe$), map(res => res?.columnsConfig?.selectedFilters), delay(500))
      .subscribe((filters) => {
        if (filters) {
          filters?.forEach(el => this.form.get(el.name)?.setValue(el.filters));
        }
      });
  }

  private clearSubscriptions(): void {
    if (this.selectAllSubscription) {
      this.selectAllSubscription.unsubscribe();
    }
    this.columnSubscriptions.forEach(sub => sub.unsubscribe());
    this.columnSubscriptions = [];
  }

  private emitIncludeUpdate(column: ReportingColumn, value: boolean): void {
    this.onColumnUpdate.emit([
      {
        name: column.name,
        reportingColumnType: column.reportingColumnType,
        include: value
      }
    ]);
  }

  private emitValueUpdate(column: ReportingColumn, value: string[]): void {
    const newValueLength = value?.length,
      oldValueLength = column.filters ? (column.filters as string[]).length : 0;
    let include = false;
    if (newValueLength === 1) {
      include = false;
    } else if (newValueLength === 0) {
      include = true;
    } else if (oldValueLength === 1 && newValueLength === 2) {
      include = true;
    } else {
      include = column.include;
    }
    this.onColumnUpdate.emit([
      {
        name: column.name,
        reportingColumnType: column.reportingColumnType,
        filters: value,
        include
      }
    ]);
  }

  private setForm(): void {
    this.clearSubscriptions();

    const group: { [key: string]: FormControl } = {};

    if (!this.suppressSelection) {
      const selectAll = new FormControl(this.selectAllDefaultValue);
      this.selectAllSubscription = selectAll.valueChanges.subscribe(
        this.toggleSelectAll.bind(this)
      );
      group.selectAll = selectAll;
    }
    if (this.columns) {
      for (const column of this.columns) {
        group[column.name] = new FormControl(column.filters);
        if (column.type === 'text') {
          this.columnSubscriptions.push(
            group[`${column.name}`].valueChanges.subscribe(
              this.emitValueUpdate.bind(this, column)
            )
          );
        }

        if (!this.suppressSelection) {
          group[`${column.name}include`] = new FormControl(column.include);
          this.columnSubscriptions.push(
            group[`${column.name}include`].valueChanges.subscribe(
              this.emitIncludeUpdate.bind(this, column)
            )
          );
        }
      }
    }

    this.form = new FormGroup(group);
  }

  private toggleSelectAll(value: boolean): void {
    const values: any = {};
    if (this.columns) {
      this.onColumnUpdate.emit(
        this.columns.map((column: ReportingColumn) => ({
          name: column.name,
          reportingColumnType: column.reportingColumnType,
          include: value
        }))
      );
      this.selectAllDefaultValue = value;
    }
  }
}
