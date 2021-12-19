import { formatCurrency } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Account, PositionsPnlValueModel } from '@pnkl-frontend/shared';
import { Observable } from 'rxjs';

@Component({
  selector: 'positions-home-pnl-chart',
  templateUrl: './positions-home-pnl-chart.component.html',
  styleUrls: ['./positions-home-pnl-chart.component.scss']
})
export class PositionsHomePnlChartComponent implements OnChanges {
  @Input() mainAccount: Account;
  @Input() positionsPnlValues: Observable<Array<PositionsPnlValueModel>>;
  chartData = [];
  keysToShow = [];
  form: FormGroup;
  currentType = '';
  customAxisFormat = '{0}';
  types = [{ label: 'usd', value: '$' }, { label: 'pct', value: '%' }];

  get tooltipValueFormatter(): (value: number) => string {
    return this?.form?.controls?.type?.value === 'usd' ? this.currencyTooltipValueFormatter : this.pctTooltipValueFormatter;
  }

  constructor(fb: FormBuilder) {
    this.form = fb.group({
      type: [this.types[1].label, Validators.required]
    });
    this.updateAxisFormat();
    this.updateKeysToShow();
    this.currentType = this.types[1].value;


    this.form.controls.type.valueChanges.subscribe(ch => {
      this.updateAxisFormat();
      this.updateKeysToShow();
      this.currentType = this.types.find(t => t.label === ch).value;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.positionsPnlValues) {
      this.positionsPnlValues.subscribe(values => this.chartData = values);
    }
  }

  private updateAxisFormat(): void {
    this.customAxisFormat = `${this.form.controls.type.value === 'usd' ? '{0:c0}' : '{0:n2} %'}`;
  }

  private updateKeysToShow(): void {
    this.keysToShow = this.form.controls.type.value === 'usd' ? ['plVal'] : ['plPct'];
  }

  currencyTooltipValueFormatter(value: number): string {
    return formatCurrency(value, 'en-US', '$');
  }

  pctTooltipValueFormatter(value: number): string {
    return `${value} %`;
  }
}
