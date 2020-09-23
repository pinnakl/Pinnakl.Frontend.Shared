import { DecimalPipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

import * as Highcharts from 'highcharts/highstock';
import HC_exportData from 'highcharts/modules/export-data';
import HC_exporting from 'highcharts/modules/exporting';
import * as XLSX from 'xlsx';

HC_exporting(Highcharts);
HC_exportData(Highcharts);

(function(H) {
  if (XLSX && H.getOptions().exporting) {
    (H.Chart.prototype as any).downloadXLSX = function() {
      let xlsxRows = [],
        rows;
      rows = this.getDataRows(true);
      xlsxRows = rows.slice(2).map(row => {
        let formattedRow = {};
        formattedRow[rows[0][0]] = row[0];
        formattedRow[rows[0][1]] = row[1];
        formattedRow[rows[0][2]] = row[2];
        return formattedRow;
      });

      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(xlsxRows);
      ws['!cols'] = Object.keys(xlsxRows).map(() => ({
        wpx: 100
      }));
      if (xlsxRows.length) {
        Object.keys(xlsxRows[0])
          .filter((key, i) => i !== 0)
          .forEach((key, i) => {
            const column = String.fromCharCode(i + 2 + 64);
            for (let j = 2; j <= xlsxRows.length + 1; j++) {
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
    };

    // Default lang string, overridable in i18n options
    (H.getOptions().lang as any).downloadXLSX = 'Download XLSX';

    // Add the menu item handler
    H.getOptions().exporting.menuItemDefinitions.downloadXLSX = {
      textKey: 'downloadXLSX',
      onclick: function() {
        (this as any).downloadXLSX();
      }
    };

    // Replace the menu item
    let menuItems = H.getOptions().exporting.buttons.contextButton.menuItems;
    menuItems[menuItems.indexOf('downloadXLS')] = 'downloadXLSX';
  }
})(Highcharts);

import { PnklComparisonAxisData } from './pnkl-comparison-axis-data.model';

@Component({
  selector: 'pnkl-comparison-chart',
  templateUrl: './pnkl-comparison-chart.component.html',
  styleUrls: ['./pnkl-comparison-chart.component.scss']
})
export class PnklComparisonChartComponent implements OnInit {
  @Input() leftAxisData: PnklComparisonAxisData[] = [];
  @Input() rightAxisData: PnklComparisonAxisData[] = [];
  @Input() leftAxisTitle: string;
  @Input() rightAxisTitle: string;

  showLeftAxisFlags = false;
  showRightAxisFlags = false;

  chartConstructor = 'stockChart';
  chartOptions: any;
  highcharts = Highcharts;
  groupingUnits = [
    [
      'week', // unit name
      [1] // allowed multiples
    ],
    ['month', [1, 2, 3, 4, 6]]
  ];

  constructor(private decimalPipe: DecimalPipe) {}

  ngOnInit(): void {
    setTimeout(() => this.setChartOptions(), 2000);
  }

  private formatAxisData(data: PnklComparisonAxisData[]): number[][] {
    if (data && data.length > 0) {
      return data.map(row => [row.date.getTime(), row.value]);
    }
    return [];
  }

  private formatFlagsData(
    data: PnklComparisonAxisData[]
  ): { x: number; text: string }[] {
    if (data && data.length > 0) {
      return this.leftAxisData
        .filter(axisData => axisData.flagQuantity)
        .map(flag => ({
          x: flag.date.getTime(),
          text: `trade quantity: ${this.decimalPipe.transform(
            flag.flagQuantity,
            '1.2'
          )}`
        }));
    }
    return [];
  }

  private setChartOptions(): void {
    this.chartOptions = {
      chart: {
        renderTo: 'container',
        alignTicks: false
      },
      rangeSelector: {
        selected: 1
      },
      yAxis: [
        {
          title: {
            text: this.leftAxisTitle
          },
          color: 'red',
          lineWidth: 2,
          opposite: false
        },
        {
          title: {
            text: this.rightAxisTitle
          },
          labels: {
            format: '${value}'
          },
          lineWidth: 2,
          opposite: true
        }
      ],
      legend: {
        enabled: true
      },
      navigator: {
        enabled: true
      },
      plotOptions: {
        series: {
          pointPadding: 0.05,
          groupPadding: 0,
          borderWidth: 0,
          shadow: false
        }
      },
      series: [
        {
          type: 'column',
          name: this.leftAxisTitle,
          id: 'leftAxisSeries',
          data: this.formatAxisData(this.leftAxisData),
          color: 'rgb(204, 168, 56)',
          dataGrouping: {
            units: this.groupingUnits
          },
          crisp: false
          // showInLegend: true
        },
        {
          name: this.rightAxisTitle,
          yAxis: 1,
          color: 'rgb(255, 99, 88)',
          data: this.formatAxisData(this.rightAxisData),
          // showInLegend: true,
          tooltip: {
            valuePrefix: '$'
          },
          dataGrouping: {
            units: this.groupingUnits
          }
        },
        {
          type: 'flags',
          name: 'Trades',
          data: this.formatFlagsData(this.leftAxisData),
          fillColor: 'red',
          color: 'red',
          style: { color: 'red', fontSize: '2px' },
          onSeries: 'leftAxisSeries',
          shape: 'circle',
          y: -10,
          width: 6,
          height: 6
        }
      ],
      exporting: {
        csv: {
          dateFormat: '%m-%d-%Y'
        },
        buttons: {
          contextButton: {
            menuItems: [
              'viewFullscreen',
              'printChart',
              'separator',
              'downloadPNG',
              'downloadXLSX'
            ]
          }
        }
      }
    };
  }
}
