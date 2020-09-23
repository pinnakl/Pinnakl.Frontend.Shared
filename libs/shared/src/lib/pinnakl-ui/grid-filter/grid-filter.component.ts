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
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
// tslint:disable:nx-enforce-module-boundaries
import { Toastr } from '@pnkl-frontend/core';
import {
  ReportingColumn,
  ReportingService,
  ReportParameter
} from '@pnkl-frontend/shared';
import { Subscription } from 'rxjs';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'grid-filter',
  templateUrl: './grid-filter.component.html',
  animations: [
    trigger('filterVisibleChanged', [
      state('1', style({ transform: 'translateX(-106%)' })),
      state('0', style({ transform: 'translateX(0)' })),
      transition('* => *', animate('500ms'))
    ])
  ]
})
export class GridFilterComponent implements OnChanges, OnDestroy {
  @Input() columns: (ReportingColumn & { dropdownCollection: any[] })[];
  @Input() parameters: ReportParameter[];
  @Input() suppressSelection = false;
  @Input() private reportId: number;
  @Input() private typeName: string;
  @Output() private onApply: EventEmitter<void> = new EventEmitter<void>();
  form: FormGroup;
  private _filterVisible = false;
  private existingFormState: any;
  private filterSubscriptions: Subscription[] = [];
  private selectAllSubscription: Subscription;

  @Input()
  set filterVisible(value: boolean) {
    this._filterVisible = value;
    if (!value && this.form) {
      this.setFiltersandParameterValues();
    }
  }

  get filterVisible(): boolean {
    return this._filterVisible;
  }

  constructor(
    private reportingService: ReportingService,
    private toastr: Toastr
  ) {}

  ngOnDestroy(): void {
    this.clearSubscriptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const columnsChange = changes.columns,
      parametersChange = changes.parameters;
    if (columnsChange || parametersChange) {
      this.setForm();
    }
  }

  onSubmit(): void {
    this.setFiltersandParameterValues();
    this.onApply.emit();
  }

  toggleSelectAll(selectAll: boolean): void {
    const values: any = {};
    if (this.columns) {
      for (const column of this.columns) {
        values[`${column.name}include`] = selectAll;
      }
    }
    this.form.patchValue(values);
  }

  getDropdownValues(
    column: ReportingColumn & { dropdownCollection: any[] }
  ): void {
    this.setFiltersandParameterValues();
    const reportingColumns = this.columns
      .filter(col => col.name === column.name || col.filters)
      .map(col => {
        const rc = new ReportingColumn();
        rc.name = col.name;
        rc.reportingColumnType = col.reportingColumnType;
        if (col.name === column.name) {
          rc.include = true;
        } else {
          rc.filters = col.filters;
          rc.include = false;
        }
        return rc;
      });
    this.reportingService
      .getDropdownValues(
        this.reportId,
        this.parameters,
        reportingColumns,
        this.typeName
      )
      .then(options => (column.dropdownCollection = options))
      .catch(() => {
        column.dropdownCollection = [];
        this.toastr.error('An unexpected error occurred');
      });
  }

  resetAllFilters(): void {
    this.form.reset();
    this.form.patchValue({ selectAll: true });
    this.form.patchValue(this.existingFormState);
  }

  private clearSubscriptions(): void {
    if (this.selectAllSubscription) {
      this.selectAllSubscription.unsubscribe();
      delete this.selectAllSubscription;
    }
    if (this.filterSubscriptions) {
      this.filterSubscriptions.forEach(fs => fs.unsubscribe());
      this.filterSubscriptions = [];
    }
  }

  private setFiltersandParameterValues(): void {
    const { value: formValue } = this.form;
    if (this.parameters) {
      for (const parameter of this.parameters) {
        parameter.value = formValue[parameter.name];
      }
    }
    if (this.columns) {
      for (const column of this.columns) {
        column.include = this.suppressSelection
          ? true
          : formValue[`${column.name}include`];
        if (formValue[column.name]) {
          column.filters = formValue[column.name];
        }
      }
    }
  }

  private setIncludedInReportForColumn(
    column: ReportingColumn,
    newValue: any
  ): void {
    const oldValue = this.form.value[column.name],
      values = {};
    if (newValue instanceof Array ? newValue.length === 1 : newValue) {
      values[`${column.name}include`] = false;
    } else if (newValue instanceof Array ? newValue.length === 0 : !newValue) {
      values[`${column.name}include`] = true;
    } else if (oldValue instanceof Array ? oldValue.length === 1 : oldValue) {
      values[`${column.name}include`] = true;
    }
    this.form.patchValue(values);
  }

  private setForm(): void {
    this.clearSubscriptions();
    const group: any = {};
    if (!this.suppressSelection) {
      const selectAll = new FormControl(true);
      this.selectAllSubscription = selectAll.valueChanges.subscribe(
        this.toggleSelectAll.bind(this)
      );
      group.selectAll = selectAll;
    }
    if (this.parameters) {
      for (const parameter of this.parameters) {
        group[parameter.name] = new FormControl(parameter.value);
      }
    }
    if (this.columns) {
      for (const column of this.columns) {
        group[column.name] = new FormControl(column.filters);
        if (!this.suppressSelection) {
          group[`${column.name}include`] = new FormControl(column.include);
          this.filterSubscriptions.push(
            group[column.name].valueChanges.subscribe(
              this.setIncludedInReportForColumn.bind(this, column)
            )
          );
        }
      }
    }
    this.form = new FormGroup(group);
    this.existingFormState = this.form.value;
    delete this.existingFormState.selectAll;
  }
}
