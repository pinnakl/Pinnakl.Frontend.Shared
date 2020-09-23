import { Component, Input, OnInit } from '@angular/core';

import { cloneDeep, groupBy, sortBy, uniq } from 'lodash';
import * as moment from 'moment';
import * as XLSX from 'xlsx';

interface Value {
  date: Date;
}

interface Options {
  frequency: string;
  selectedItems: string[];
}

@Component({
  selector: 'pnkl-line-chart-date',
  templateUrl: './pnkl-line-chart-date.component.html',
  styleUrls: ['./pnkl-line-chart-date.component.scss']
})
export class PnklLineChartDateComponent implements OnInit {
  @Input() hideSelected = false;
  @Input() set values(values: Value[]) {
    if (!values) {
      return;
    }
    this._values = cloneDeep(values);
    this.selectionItems = [];
    values.forEach(
      dataObject =>
        (this.selectionItems = [
          ...this.selectionItems,
          ...Object.keys(dataObject ? dataObject : []).filter(
            key => key !== 'date'
          )
        ])
    );
    this.selectionItems = uniq(this.selectionItems);

    this.options = {
      ...this.options,
      selectedItems: this.selectionItems.slice(0, 5)
    };
  }

  @Input() valuesType: 'currency' | 'number' = 'number';

  chartDataItems: Value[] = [];
  options: Options = { frequency: 'Daily', selectedItems: [] };
  selectionItems: string[] = [];
  valueFormat: string;

  private _values: Value[] = [];

  ngOnInit(): void {
    this.valueFormat = this.valuesType === 'currency' ? 'c' : '{0:N2}';
  }

  exportToExcel(): void {
    const formattedItems = this.chartDataItems.map(item => {
      const formattedItem = {};
      Object.keys(item)
        .filter(key => key !== '_date_date')
        .forEach(key => {
          formattedItem[key.toUpperCase()] = item[key];
        });
      return formattedItem;
    });
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedItems);
    ws['!cols'] = Object.keys(formattedItems).map(() => ({
      wpx: 100
    }));
    if (formattedItems.length) {
      Object.keys(formattedItems[0])
        .filter((key, i) => i !== 0)
        .forEach((key, i) => {
          const column = String.fromCharCode(i + 2 + 64);
          for (let j = 2; j <= formattedItems.length + 1; j++) {
            ws[`${column}${j}`] = {
              ...ws[`${column}${j}`],
              z: '#,##0.00'
            };
          }
        });
    }
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'Export.xlsx');
  }

  onOptionsChange(): void {
    const { frequency } = this.options;
    const groups = groupBy(this._values, this.getGroupingFunction(frequency));
    const groupedValues = Object.values(groups).map(
      values => values[values.length - 1]
    );
    const groupedValuesSorted = sortBy(groupedValues, [item => item.date]);
    this.chartDataItems = groupedValuesSorted;
  }

  private getGroupingFunction(frequency: string): (value: Value) => string {
    switch (frequency) {
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
}

/*
Example -
  values = [
    { date: new Date('01/01/2019'), english: 50, math: 89 },
    { date: new Date('02/01/2019'), english: 95, math: 80 }
  ];
  <pnkl-line-chart-date [values]="values"></pnkl-line-chart-date>
*/
