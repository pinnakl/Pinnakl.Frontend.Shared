import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component, EventEmitter,
  Input, OnChanges,
  OnInit, Output, SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PinnaklSpinner, Toastr } from '@pnkl-frontend/core';

import { Observable } from 'rxjs';

import * as moment from 'moment';

import {
  CurrencyForOMS, Destroyable,
  IdcColumn,
  ReportingColumn
} from '@pnkl-frontend/shared';
import { finalize, takeUntil } from 'rxjs/operators';
import { PositionsUiStateFacade } from '../../positions-ui-state/positions-ui-state-facade.service';
import { PositionHomeService, PresetType } from '../position-home/position-home.service';

@Component({
  selector: 'positions-report-config',
  templateUrl: './positions-report-config.component.html',
  animations: [
    trigger('visibleChanged', [
      state('1', style({ transform: 'translateX(0px)', display: 'block' })),
      state('0', style({ transform: 'translateX(100%)', display: 'block' })),
      transition('* => *', animate('300ms'))
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./positions-report-config.component.scss']
})
export class PositionsReportConfigComponent extends Destroyable implements OnInit, OnChanges {
  @Input() configVisible = false;
  @Input() importantColumnNames: string[];

  @Input() availableGridPresets: any[];
  @Input() availableWidgetPresets: any[];
  @Input() originalGridPresetId: string;
  @Input() originalWidgetPresetId: string;

  presetIdToDelete = undefined;
  selectedGridPresetId: string;
  selectedWidgetPresetId: string;
  showDeletePresetConfirmation = false;

  @Output() onApplyPresets = new EventEmitter<any>();
  @Output() selectPresetOnDeleting = new EventEmitter<any>();

  availableReportingColumns$: Observable<ReportingColumn[]>;
  allIdcColumns$: Observable<IdcColumn[]>;
  currencies$: Observable<CurrencyForOMS[]>;
  selectedIdcColumns$: Observable<ReportingColumn[]>;
  selectedReportingColumns$: Observable<ReportingColumn[]>;

  isCurrencyDropdownVisible = true;

  hideSharePresetsModal = true;

  gridFontSizeForm: FormGroup;
  readonly fontSizes = [13, 14, 15, 16, 17, 18];

  private currentPreset: {fontSize: number, id?: string};

  constructor(
    private readonly fb: FormBuilder,
    private readonly toastr: Toastr,
    private readonly spinner: PinnaklSpinner,
    private readonly positionHomeService: PositionHomeService,
    private readonly positionsUIStateFacadeSvc: PositionsUiStateFacade
  ) {
    super();
  }

  get isApplyDisabled(): boolean {
    return this.originalGridPresetId === this.selectedGridPresetId;
    // todo uncomment later when widgets will be working as expected
    // return this.originalGridPresetId !== this.selectedGridPresetId || this.originalWidgetPresetId !== this.selectedWidgetPresetId;
  }

  selectPreset(preset: any, type: 'grid' | 'widget'): void {
    if (type === 'grid') {
      this.selectedGridPresetId = preset.id;
    } else {
      this.selectedWidgetPresetId = preset.id;
    }
    this.onApplyPresets.emit({
      selectedGridPresetId: this.availableGridPresets.length && this.selectedGridPresetId,
      selectedWidgetPresetId: this.availableWidgetPresets.length && this.selectedWidgetPresetId,
      presetName: preset.name
    });
  }

  startDeletePreset(id: string): void {
    this.showDeletePresetConfirmation = true;
    this.presetIdToDelete = id;
  }

  cancelDeletePreset(): void {
    this.showDeletePresetConfirmation = false;
    this.presetIdToDelete = undefined;
  }

  async deletePreset(): Promise<void> {
    this.spinner.spin();
    this.showDeletePresetConfirmation = false;

    try {
      await this.positionHomeService.deletePreset(this.presetIdToDelete);
      this.toastr.success('Preset deleted successfully');
      this.selectPresetOnDeleting.emit();
    } catch (e) {
      this.toastr.error('Preset deleted unsuccessfully');
      this.spinner.stop();
    } finally {
      this.presetIdToDelete = undefined;
    }
  }

  addColumns(columns: ReportingColumn[]): void {
    this.positionsUIStateFacadeSvc.selectColumns(columns);
  }

  ngOnInit(): void {
    this.availableReportingColumns$ = this.positionsUIStateFacadeSvc.positionsConfigAvailableReportColumns$;
    this.allIdcColumns$ = this.positionsUIStateFacadeSvc.positionsConfigAllIdcColumns$;
    this.currencies$ = this.positionsUIStateFacadeSvc.selectAllCurrencies();
    this.selectedIdcColumns$ = this.positionsUIStateFacadeSvc.positionsConfigSelectedIdcColumns$;
    this.selectedReportingColumns$ = this.positionsUIStateFacadeSvc.positionsConfigSelectedReportColumns$;

    this.initializeSelectedPresets();
    this.initFontSizeForm();
  }

  private initFontSizeForm(): void {
    this.currentPreset = this.positionHomeService.pmsGridFontSizeConfig$.getValue();
    this.gridFontSizeForm = this.fb.group({ fontSize: this.currentPreset.fontSize });
    this.watchFontSize();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.configVisible && !changes.configVisible.firstChange && changes.configVisible.currentValue) {
      this.initializeSelectedPresets();
    }
  }

  onCurrencySelected(currency: CurrencyForOMS): void {
    this.positionsUIStateFacadeSvc.loadSelectedCurrency(
      currency,
      moment().subtract(1, 'day').toDate()
    );
  }

  removeColumns(columns: ReportingColumn[]): void {
    this.positionsUIStateFacadeSvc.unselectColumns(columns);
  }

  toggleSharePresetsModal(): void {
    this.hideSharePresetsModal = !this.hideSharePresetsModal;
  }

  private initializeSelectedPresets(): void {
    this.selectedGridPresetId = this.originalGridPresetId;
    this.selectedWidgetPresetId = this.originalWidgetPresetId;
  }

  private watchFontSize(): void {
    this.gridFontSizeForm.get('fontSize').valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((fontSize: number) => {
        if (fontSize) {
          this.savePreset(fontSize);
        }
      });
  }

  private savePreset(fontSize: number): void {
    const presetId = this.positionHomeService.pmsGridFontSizeConfig$?.getValue()?.id;
    this.spinner.spin();
    if (presetId) {
      this.updatePreset(presetId, fontSize);
    } else {
      this.createPreset(fontSize);
    }
    this.positionHomeService.pmsGridFontSizeConfig$.next({...this.positionHomeService.pmsGridFontSizeConfig$.getValue(), fontSize});
  }

  private updatePreset(presetId: string, fontSize: number): void {
    this.positionHomeService.updatePreset(
      {...this.positionHomeService.generatePresetConfig({ fontSize },
          PresetType.PMS_GRID_FONT_SIZE), id: presetId}, PresetType.PMS_GRID_FONT_SIZE)
      .pipe(takeUntil(this.unsubscribe$), finalize(() => this.spinner.stop()))
      .subscribe(() => this.toastr.success('Font size was updated'),
        (err: HttpErrorResponse) => {
        this.toastr.error('Error while updatePreset');
        console.error('Error while updatePreset', err);
      });
  }

  private createPreset(fontSize: number): void {
    this.positionHomeService.createPreset(
      { ...this.positionHomeService.generatePresetConfig({ fontSize }, PresetType.PMS_GRID_FONT_SIZE ) },
      PresetType.PMS_GRID_FONT_SIZE)
      .pipe(takeUntil(this.unsubscribe$), finalize(() => this.spinner.stop()))
      .subscribe(() => this.toastr.success('Font size was saved'),
        (err: HttpErrorResponse) => {
        this.toastr.error('Error while createPreset');
        console.error('Error while createPreset', err);
      });
  }
}
