import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges
} from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
// tslint:disable:nx-enforce-module-boundaries
import { PinnaklSpinner, Toastr, UserService } from '@pnkl-frontend/core';
import * as moment from 'moment';
import { DurationInputArg2 } from 'moment';
import { Subject, Subscription } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ReportingColumn, ReportParameter } from '../../models';
import { ReportingService } from '../../pinnakl-web-services';
import { Utility } from '../../services';
import { AllowedPresetsPage, FilterPresetsService, Preset } from './filter-presets/filter-presets.service';

export enum OmsDateFilter {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR',
  MTD = 'MTD',
  QTD = 'ATD',
  YTD = 'YTD'
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'grid-filter',
  templateUrl: './grid-filter.component.html',
  styleUrls: ['./grid-filter.component.scss'],
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
  @Input() private readonly reportId: number;
  @Input() private readonly typeName: string;
  @Output() private readonly onApply: EventEmitter<void> = new EventEmitter<void>();
  @Output() private readonly onReset: EventEmitter<void> = new EventEmitter<void>();

  presets: Preset[];
  form: FormGroup;
  omsDateFiltersForm: FormGroup;
  toDateFiltersForm: FormGroup;
  selectPresetForm: FormGroup;
  isSavePresetsHide = true;
  selectedPreset: Preset = null;
  deletePresetConfirmationVisible = false;
  readonly omsDateFilterEnum = OmsDateFilter;

  private _filterVisible = false;
  private existingFormState: any;
  private filterSubscriptions: Subscription[] = [];
  private selectAllSubscription: Subscription;
  private readonly unsubscribe$ = new Subject<void>();
  private readonly module: AllowedPresetsPage;

  readonly previousFiltersControls = [
    { id: "previousDayRadio", value: this.omsDateFilterEnum.DAY, name: "Day" },
    { id: "previousWeekRadio", value: this.omsDateFilterEnum.WEEK, name: "Week" },
    { id: "previousMonthRadio", value: this.omsDateFilterEnum.MONTH, name: "Month" },
    { id: "previousQuarterRadio", value: this.omsDateFilterEnum.QUARTER, name: "Quarter" },
    { id: "previousYearRadio", value: this.omsDateFilterEnum.YEAR, name: "Year" }
  ];

  readonly toDateFiltersControls = [
    { id: "monthToDayRadio", value: this.omsDateFilterEnum.MTD, name: "MTD" },
    { id: "quarterToDayRadio", value: this.omsDateFilterEnum.QTD, name: "QTD" },
    { id: "yearToDayRadio", value: this.omsDateFilterEnum.YTD, name: "YTD" }
  ];

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

  get isDatesValid(): boolean {
    // for may doesn't contain any controls. Only when both controls exists - start check
    if (!this.startDateFormControl && !this.endDateFormControl) {
      return;
    }
    return moment(this.startDateFormControl.value).isSameOrBefore(moment(this.endDateFormControl.value));
  }

  constructor(
    private readonly reportingService: ReportingService,
    private readonly _userService: UserService,
    private readonly _filterPresetsService: FilterPresetsService,
    private readonly _router: Router,
    private readonly _spinner: PinnaklSpinner,
    private readonly _fb: FormBuilder,
    private readonly _utility: Utility,
    private readonly toastr: Toastr
  ) {
    this.module = this._router.url.includes(AllowedPresetsPage.OMS.toLowerCase()) ? AllowedPresetsPage.OMS : AllowedPresetsPage.EMS;

    this.initOmsDateFiltersForms();
    this.initToDateFiltersForms();
    this.watchPresetsControls();
  }

  get shouldFilterHaveDateRangePresets(): boolean {
    const isOmsOrEms = this._router.url.includes('oms') || this._router.url.includes('ems');
    return isOmsOrEms || (this.parameters?.length === 2
      && this.parameters.some(param => param.name.includes('startdate'))
      && this.parameters.some(param => param.name.includes('enddate')));
  }

  ngOnChanges(changes: SimpleChanges): void {
    const columnsChange = changes.columns,
      parametersChange = changes.parameters;
    if (columnsChange || parametersChange) {
      this.setForm();
      this.getPresets();
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
    this.omsDateFiltersForm.get('filterDate').setValue(null, { emitEvent: false });
    this.onReset.emit();
  }

  toggleModal(): void {
    this.isSavePresetsHide = !this.isSavePresetsHide;
  }

  deletePreset(preset: Preset): void {
    this._spinner.spin();
    preset.showDelete = false;
    this._filterPresetsService.deletePreset(preset.id)
      .pipe(
        takeUntil(this.unsubscribe$),
        finalize(() => this._spinner.stop()))
      .subscribe(() => {
        this.presets = this.presets.filter((el: Preset) => el.id !== preset.id);
        this.toastr.success('Preset was deleted');
      }, (err: HttpErrorResponse) => {
        this.toastr.error('Error while delete Preset');
        console.error('Error while delete Preset', err);
      });
  }

  showPresetConfirmation($event: any, preset: any): void {
    $event.preventDefault();
    this.presets.forEach(el => el['showDelete'] = false);
    preset.showDelete = true;
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

  private initOmsDateFiltersForms(): void {
    this.omsDateFiltersForm = this._fb.group({ filterDate: null });
    this.selectPresetForm = this._fb.group({ preset: null });
  }

  private initToDateFiltersForms(): void {
    this.toDateFiltersForm = this._fb.group({ filterDate: null });
  }

  private watchPresetsControls(): void {
    this.omsDateFiltersForm.controls.filterDate.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((dateFilter: OmsDateFilter) => {
        this.toDateFiltersForm.controls.filterDate.setValue(null, { emitEvent: false });
        this.updateFormDates(dateFilter);
      });

    this.toDateFiltersForm.controls.filterDate.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((dateFilter: OmsDateFilter) => {
        this.omsDateFiltersForm.controls.filterDate.setValue(null, { emitEvent: false });
        this.updateFormDates(dateFilter);
      });

    this.selectPresetForm.controls.preset.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((preset: Preset) => {
        this.setFormFromPreset(preset);
      });
  }

  private setFormFromPreset(preset: Preset): void {
    const presetValuesKeys = Object.keys(preset.presetConfig);
    this.form.reset();
    presetValuesKeys.forEach((key: string) => {
      if (key === 'startdate' || key === 'enddate' || key === 'tradedate' || key === 'settledate') {
        this.form.get(key).setValue(new Date(preset.presetConfig[key]));
      } else {
        this.form.get(key).setValue(preset.presetConfig[key]);
      }
    });
    if (!this.startDateFormControl.value && !this.endDateFormControl.value) {
      this.startDateFormControl.setValue(new Date());
      this.endDateFormControl.setValue(new Date());
    }
  }

  private updateFormDates(dateFilter: OmsDateFilter): void {
    const subtractPeriod = dateFilter.toLowerCase();

    if (dateFilter === OmsDateFilter.DAY) {
      this.startDateFormControl.setValue(this._utility.getPreviousBusinessDay());
      this.endDateFormControl.setValue(this._utility.getPreviousBusinessDay());
      return;
    }

    if (dateFilter === OmsDateFilter.MTD) {
      this.startDateFormControl.setValue(this._utility.getCurrentFirstDayOf('month'));
      return;
    }

    if (dateFilter === OmsDateFilter.QTD) {
      this.startDateFormControl.setValue(this._utility.getCurrentFirstDayOf('quarter'));
      return;
    }

    if (dateFilter === OmsDateFilter.YTD) {
      this.startDateFormControl.setValue(this._utility.getCurrentFirstDayOf('year'));
      return;
    }

    this.startDateFormControl.setValue(
      moment().subtract(1, subtractPeriod as DurationInputArg2).startOf(subtractPeriod as DurationInputArg2).toDate()
    );

    this.endDateFormControl.setValue(
      moment().subtract(1, subtractPeriod as DurationInputArg2).endOf(subtractPeriod as DurationInputArg2).toDate()
    );
  }

  private get startDateFormControl(): AbstractControl {
    return this.form?.controls?.startdate;
  }

  private get endDateFormControl(): AbstractControl {
    return this.form?.controls?.enddate;
  }

  private getPresets(): void {
    this._filterPresetsService.getPresets(this._userService.getUser().id, this.module)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res: Preset[]) => this.presets = res,
        (err: HttpErrorResponse) => {
          this.toastr.error('Error while get presets');
          console.error('Error while get presets', err);
        });
  }

  ngOnDestroy(): void {
    this.clearSubscriptions();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  closeModalAndRefreshData(): void {
    this.isSavePresetsHide = true;
    this.getPresets();
  }
}
