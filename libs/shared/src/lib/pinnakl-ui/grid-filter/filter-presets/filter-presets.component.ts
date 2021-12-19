import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PinnaklSpinner, Toastr, UserService } from '@pnkl-frontend/core';
import { isNil, omitBy } from 'lodash';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AllowedPresetsPage, FilterPresetsService, preset_config_name } from './filter-presets.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'filter-presets',
  templateUrl: './filter-presets.component.html',
  styleUrls: ['./filter-presets.component.scss']
})

export class FilterPresetsComponent implements OnInit, OnDestroy {
  @Input() presetValues: any = null;
  @Output() closeModal = new EventEmitter<void>();

  presetsForm: FormGroup;

  private readonly module: AllowedPresetsPage;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private readonly _router: Router,
    private readonly _userService: UserService,
    private readonly _filterPresetsService: FilterPresetsService,
    private readonly _spinner: PinnaklSpinner,
    private readonly _fb: FormBuilder,
    private readonly _toastr: Toastr) {
    this.module = this._router.url.includes(AllowedPresetsPage.OMS.toLowerCase()) ? AllowedPresetsPage.OMS : AllowedPresetsPage.EMS;
  }

  ngOnInit(): void {
    this.initPresetsForm();
  }

  submitForm(): void {
    const preset: any = {};
    const presetValue = omitBy(this.presetValues, isNil);
    if (!this.presetsForm.get('includeDateRange').value) {
      delete presetValue.startdate;
      delete presetValue.enddate;
    }
    presetValue.presetname = this.presetsForm.get('presetName').value;
    preset.userid = this._userService.getUser().id.toString();
    preset.module = this.module;
    preset.configname = preset_config_name;
    preset.configvalue = JSON.stringify(presetValue);
    this.createPreset(preset);
  }

  private createPreset(preset: any): void {
    this._spinner.spin();
    this._filterPresetsService.createPreset(preset)
      .pipe(
        takeUntil(this.unsubscribe$),
        finalize(() => this._spinner.stop()))
      .subscribe(() => {
        this._toastr.success('Preset was created');
        this.closeModal.emit();
      }, (err: HttpErrorResponse) => {
        this._toastr.error('Error while create preset');
        console.error('Error while create preset', err);
      });
  }

  private initPresetsForm(): void {
    this.presetsForm = this._fb.group({
      presetName: ['', [Validators.required]],
      includeDateRange: false
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
