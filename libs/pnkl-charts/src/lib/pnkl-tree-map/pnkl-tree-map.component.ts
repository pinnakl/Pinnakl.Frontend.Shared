import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';

import * as Highcharts from 'highcharts';
import Exporting from 'highcharts/modules/exporting';
import Heatmap from 'highcharts/modules/heatmap';
import Tree from 'highcharts/modules/treemap';

import { BehaviorSubject, Subscription } from 'rxjs';
import { auditTime } from 'rxjs/operators';
import { PnklTreeMapService, tooltipFormatter } from './pnkl-tree-map.service';

Exporting(Highcharts);
Heatmap(Highcharts);
Tree(Highcharts);

@Component({
  selector: 'pnkl-tree-map',
  templateUrl: 'pnkl-tree-map.component.html',
  styleUrls: ['pnkl-tree-map.component.scss'],
  providers: [PnklTreeMapService]
})
export class PnklTreeMapComponent implements OnDestroy, OnInit, OnChanges {
  @Input() categoryName: string;
  @Input() categoryValuesField: string;
  @Input() data: any[];
  @Input() dataField: string;
  @Input() dataLabelField: string;
  @Input() isNestedTreeMap = false;
  @Input() maxAxisLabel: string;
  @Input() minAxisLabel: string;
  @Input() title = '';
  @Input() tooltipHeaderFields: string[] = [];
  @Input() tooltipDataFields: string[] = [];

  _data: any[];
  chartConstructor = 'chart';
  chartOptions: any;
  dataSubject = new BehaviorSubject<any[]>([]);
  dataSubscription: Subscription;
  highcharts = Highcharts;
  levels: any[];
  updateFlag = true;

  constructor(private pnklTreeMapService: PnklTreeMapService) {}

  ngOnChanges(changes: any): void {
    if (changes.title) {
      this.setOptions();
      setTimeout(() => {
        this.dataSubject.next(changes.data.currentValue);
      });
    } else if (changes.data) {
      this.dataSubject.next(changes.data.currentValue);
    }
    if (this.tooltipHeaderFields.length < 1) {
      this.tooltipHeaderFields = [this.dataLabelField, this.dataField];
    }
    if (this.tooltipDataFields.length < 1) {
      this.tooltipDataFields = [this.dataLabelField, this.dataField];
    }
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    let subscriptionInterval = setInterval(() => {
      if (
        this.highcharts.charts &&
        this.highcharts.charts.find(chartItem => !!chartItem)
      ) {
        this.dataSubscription = this.dataSubject
          .pipe(auditTime(250))
          .subscribe(value => {
            this.setTreeMapData(value);
          });
        clearInterval(subscriptionInterval);
      }
    }, 200);

    this.setOptions();
  }

  private setTreeMapData(value: any[]): void {
    this._data = value;
    this.highcharts.charts
      .find(chartItem => !!chartItem)
      .series[0].setData(
        this.pnklTreeMapService.getFormattedTreeMapData(
          this.categoryName,
          this.categoryValuesField,
          this.dataField,
          this.dataLabelField,
          this.isNestedTreeMap,
          value
        ),
        true,
        null,
        true
      );
  }

  private setOptions(): void {
    if (this.isNestedTreeMap) {
      this.levels = [
        {
          level: 1,
          layoutAlgorithm: 'squarified',
          dataLabels: {
            enabled: true,
            align: 'center',
            verticalAlign: 'top',
            className: 'tree-map-category-label',
            y: 0,
            style: {
              fontWeight: 'bold',
              fontSize: '15px',
              textOutline: false,
              fontFamily: 'Source Sans Pro, sans-serif',
              marginTop: '-3px !important',
              top: '0px'
            }
          },
          borderWidth: 4,
          borderColor: 'black'
        }
      ];
    }
    this.chartOptions = {
      title: {
        text: ''
      },
      tooltip: {
        useHTML: true,
        formatter: tooltipFormatter(this),
        valueDecimals: 2,
        backgroundColor: 'white',
        outside: true,
        style: {
          'z-index': '1000',
          fontSize: '15px'
        }
      },
      series: [
        {
          type: 'treemap',
          layoutAlgorithm: 'squarified',
          data: [],
          dataLabels: {
            enabled: true,
            style: {
              fontWeight: 'bold',
              fontSize: '15px',
              textOutline: false,
              fontFamily: 'Source Sans Pro, sans-serif'
            }
          },
          borderColor: 'white',
          borderWidth: 1,
          levels: this.levels
        }
      ],
      plotOptions: {
        treemap: {
          dataLabels: {
            formatter: this.pnklTreeMapService.dataLabelFormatter,
            useHTML: true,
            allowOverlap: true
          }
        }
      }
    };
  }
}
