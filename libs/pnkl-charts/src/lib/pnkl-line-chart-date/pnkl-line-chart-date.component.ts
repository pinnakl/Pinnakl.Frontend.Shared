import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { cloneDeep, sortBy, uniq } from 'lodash';
import * as moment from 'moment';

interface Value {
  date: Date;
}

interface Options {
  frequency: string;
  selectedItems: string[];
}

interface ChartCustomStyles {
  height?: string;
}

@Component({
  selector: 'pnkl-line-chart-date',
  templateUrl: './pnkl-line-chart-date.component.html',
  styleUrls: ['./pnkl-line-chart-date.component.scss']
})
export class PnklLineChartDateComponent implements OnInit, OnChanges {
  private _styles: ChartCustomStyles;
  @Input() fitToData = false;
  @Input() showLegend = true;
  @Input() colors = undefined;
  @Input() customAxisFormat = '{0}';
  @Input() defaultFrequency = 'Daily';
  @Input() customCategoriesAxis = false;
  @Input() minValue: undefined | number;
  @Input() maxValue: undefined | number;
  @Input() tooltipDatePipeFormat = 'mediumDate';
  @Input() tooltipValueFormatter: (value: number) => string;

  @Input() set customStyles(styles: ChartCustomStyles) {
    this._styles = styles;
  }
  get customStyles() {
    return this.transformInputStyles();
  }

  @Input() set keysToShow(keysToShow: string[]) {
    this._keysToShow = keysToShow;
    this.recreateOptions();
  }

  @Input() set values(values: Value[]) {
    if (!values) {
      return;
    }
    this._values = cloneDeep(values);
    this.recreateOptions();
  }

  chartDataItems: any = [];
  selectionItems: string[] = [];
  options: Options = { frequency: 'Daily', selectedItems: [] };
  startMarket = new Date(
    `${(new Date()).getMonth() + 1}/${(new Date()).getDate()}/${(new Date()).getFullYear()} 2:35:00 PM Z`
  );

  private _values: Value[] = [];
  private _keysToShow: string[] = [];

  ngOnInit(): void {
    if (this.defaultFrequency !== 'Daily') {
      this.options = { frequency: this.defaultFrequency, selectedItems: [...this.options.selectedItems] };
    }
    this.onOptionsChange();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.values || changes.keysToShow || changes.tooltipValueFormatter) {
      this.onOptionsChange();
    }
  }

  onOptionsChange(): void {
    this.chartDataItems = <any>sortBy(this._values, [item => item.date]);
    const hasMultipleLines = this.chartDataItems.length > 1;

    if (this.fitToData) {
      this.maxValue = undefined;
      this.minValue = undefined;
      if (!hasMultipleLines) {
        this.selectionItems.forEach(itemKey => {
          this.chartDataItems[0].data?.forEach(item => {
            if (this.maxValue === undefined) {
              this.maxValue = item[itemKey];
            }
            if (this.minValue === undefined) {
              this.minValue = item[itemKey];
            }
            this.maxValue = Math.max(+item[itemKey], this.maxValue);
            this.minValue = Math.min(+item[itemKey], this.minValue);
          });
        });
      } else {
        this.showLegend = true;
      }
      if (this.maxValue) {
        this.maxValue += (this.maxValue - this.minValue) / 100 * 3;
        this.minValue -= (this.maxValue - this.minValue) / 100 * 3;
      }
    } else {
      this.maxValue = undefined;
      this.minValue = undefined;
    }
  }

  private recreateOptions(): void {
    this.selectionItems = [];
    this._values[0]['data'].forEach(
      dataObject =>
        (this.selectionItems = [
          ...this.selectionItems,
          ...Object.keys(dataObject ? dataObject : []).filter(
            key => key !== 'date' && key !== 'key'
          )
        ])
    );
    this.selectionItems = uniq(this.selectionItems);
    if (this._keysToShow.length !== 0) {
      this.selectionItems = this._keysToShow;
    }

    this.options = {
      ...this.options,
      selectedItems: this.selectionItems.slice(0, 5)
    };
  }

  private getGroupingFunction(frequency: string): (value: Value) => string {
    switch (frequency) {
      case 'Minutely':
        return ({ date }: Value) => moment(date).format('HH:mm');
      case 'Daily':
        return ({ date }: Value) => moment(date).format('MM/DD/YYYY');
      case 'Weekly':
        return ({ date }: Value) => {
          const dateMoment = moment(date);
          return `${dateMoment.year()}-${dateMoment.week()}`;
        };
      case 'Monthly':
        return ({ date }: Value) => {
          const dateMoment = moment(date);
          return `${dateMoment.year()}-${dateMoment.month()}`;
        };
      case 'Quarterly':
        return ({ date }: Value) => {
          const dateMoment = moment(date);
          return `${dateMoment.year()}-${dateMoment.quarter()}`;
        };
      case 'Half Yearly':
        return ({ date }: Value) => {
          const dateMoment = moment(date);
          return `${dateMoment.year()}-${dateMoment.quarter() < 3}`;
        };
      case 'Yearly':
        return ({ date }: Value) => {
          const dateMoment = moment(date);
          return dateMoment.year().toString();
        };
      default:
        throw new Error('Invalid frequency');
    }
  }

  private transformInputStyles(): ChartCustomStyles {
    return {
      height: `${this._styles.height}px`
    };
  }
}

/*
Example -
  values = [
    { date: new Date('01/01/2019'), english: 50, math: 89 },
    { date: new Date('02/01/2019'), english: 95, math: 80 }
  ];
  <pnkl-line-stockchart-date [values]="values"></pnkl-line-stockchart-date>
*/
