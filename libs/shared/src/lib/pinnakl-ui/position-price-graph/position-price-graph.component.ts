import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
declare let d3: any;

import { PinnaklSpinner } from '@pnkl-frontend/core';
import { PositionService } from '../../pinnakl-web-services/position.service';

@Component({
  selector: 'position-price-graph',
  templateUrl: './position-price-graph.component.html',
  styleUrls: ['./position-price-graph.component.scss']
})
export class PositionPriceGraph implements OnInit {
  @Input() securityId: string;
  @Input() comparisonSecurities: Array<any>;
  positionPriceGraphOptions: any;
  positionPriceGraphData: any;
  priceHistoryArr: Array<any> = [];
  positionArr: Array<any> = [];
  comparisonPriceArr: Array<any> = [];
  exportToExcelArr: Array<any> = [];
  chartData: any = {};
  exportToExcelDataList: any;
  positionData: any[];
  priceData: any[];
  positionPriceDates: any[];
  positionPriceStep: number;
  // private excelBtnColumnNames: any = {
  //     date: 'Date',
  //     price: 'Price',
  //     position: 'Position'
  // };

  constructor(
    private positionService: PositionService,
    private spinner: PinnaklSpinner
  ) {}

  ngOnInit() {
    this.spinner.spin();
    if (this.comparisonSecurities && this.comparisonSecurities.length) {
      this.loadGraphForMultipleSecurities();
    } else {
      this.loadGraphForSingleSecurity();
    }
  }

  loadGraphForMultipleSecurities() {
    let securities: Array<any> = [];
    this.comparisonSecurities.forEach((security, index) => {
      securities.push(
        new Promise((resolve, reject) => {
          this.positionService
            .getPriceHistoryChart(security.id)
            .then(priceHistory => {
              if (priceHistory && priceHistory.length > 0) {
                let priceArr = [];
                let priceMinMaxArray = priceHistory;

                priceMinMaxArray.sort((a, b) => {
                  return a.price - b.price;
                });
                let maxPrice = parseInt(
                  priceMinMaxArray[priceMinMaxArray.length - 1].price
                );
                let minPrice = parseInt(priceMinMaxArray[0].price);
                if (!this.chartData.priceMaxValue) {
                  this.chartData.priceMaxValue = maxPrice;
                }
                if (!this.chartData.priceMinValue) {
                  this.chartData.priceMinValue = minPrice;
                }
                this.chartData.priceMaxValue =
                  maxPrice > this.chartData.priceMaxValue
                    ? maxPrice
                    : this.chartData.priceMaxValue;
                this.chartData.priceMinValue =
                  minPrice < this.chartData.priceMinValue
                    ? minPrice
                    : this.chartData.priceMinValue;

                priceHistory.sort((a, b) => {
                  return +new Date(a.date) - +new Date(b.date);
                });
                let maxDate = parseInt(
                  moment(
                    priceHistory[priceHistory.length - 1].date,
                    'MM/DD/YYYY hh:mm:ss A'
                  ).format('x')
                );
                let minDate = parseInt(
                  moment(priceHistory[0].date, 'MM/DD/YYYY hh:mm:ss A').format(
                    'x'
                  )
                );
                if (!this.chartData.maxDateValue) {
                  this.chartData.maxDateValue = maxDate;
                }
                if (!this.chartData.minDateValue) {
                  this.chartData.minDateValue = minDate;
                }
                this.chartData.maxDateValue =
                  maxDate > this.chartData.maxDateValue
                    ? maxDate
                    : this.chartData.maxDateValue;
                this.chartData.minDateValue =
                  minDate < this.chartData.minDateValue
                    ? minDate
                    : this.chartData.minDateValue;

                // this.excelBtnColumnNames[security.ticker] = security.ticker;
                let flag = false;
                if (this.exportToExcelArr.length === 0) {
                  this.exportToExcelArr = priceHistory.map(x => {
                    let tempExcelJson: any = {};
                    tempExcelJson.date = moment(
                      x.date,
                      'MM/DD/YYYY hh:mm:ss A'
                    ).format('MM/DD/YYYY');
                    tempExcelJson.price = 0;
                    tempExcelJson.position = 0;
                    tempExcelJson[security.ticker] = x.price;
                    return tempExcelJson;
                  });
                  flag = true;
                }

                priceHistory.forEach(price => {
                  if (flag === false) {
                    let exportExcelJson = this.exportToExcelArr.find(x => {
                      return (
                        moment(price.date, 'MM/DD/YYYY hh:mm:ss A').format(
                          'MM/DD/YYYY'
                        ) == x.date
                      );
                    });
                    if (exportExcelJson) {
                      exportExcelJson[security.ticker] = price.price;
                    } else {
                      let newExportExcelJson: any = {};
                      newExportExcelJson.date = moment(
                        price.date,
                        'MM/DD/YYYY hh:mm:ss A'
                      ).format('MM/DD/YYYY');
                      newExportExcelJson.price = 0;
                      newExportExcelJson.position = 0;
                      for (let k = index; k >= 1; k--) {
                        newExportExcelJson[
                          this.comparisonSecurities[index - k].ticker
                        ] = 0;
                      }
                      newExportExcelJson[security.ticker] = price.price;
                      this.exportToExcelArr.push(newExportExcelJson);
                    }
                  }
                  let priceHistorySubArr = [
                    parseInt(
                      moment(price.date, 'MM/DD/YYYY hh:mm:ss A').format('x')
                    ),
                    price.price
                  ];
                  priceArr.push(priceHistorySubArr);
                });

                this.comparisonPriceArr.push({
                  key: security.ticker,
                  values: priceArr
                });
              }
              resolve(true);
            });
        })
      );
    });
    Promise.all(securities).then(() => {
      this.loadGraphForSingleSecurity();
    });
  }

  loadGraphForSingleSecurity() {
    this.positionService
      .getPriceHistoryChart(this.securityId)
      .then(this.preparePriceHistoryChartDataAndExecutePositionChart.bind(this))
      .then(this.preparePositionChartDataAndRenderGraph.bind(this));
  }

  preparePriceHistoryChartDataAndExecutePositionChart(priceHistory) {
    if (priceHistory && priceHistory.length > 0) {
      let priceMinMaxArray = priceHistory;
      priceMinMaxArray.sort((a, b) => {
        return a.price - b.price;
      });
      let maxPrice = parseInt(
        priceMinMaxArray[priceMinMaxArray.length - 1].price
      );
      let minPrice = parseInt(priceMinMaxArray[0].price);
      if (!this.chartData.priceMaxValue) {
        this.chartData.priceMaxValue = maxPrice;
      }
      if (!this.chartData.priceMinValue) {
        this.chartData.priceMinValue = minPrice;
      }
      this.chartData.priceMaxValue =
        maxPrice > this.chartData.priceMaxValue
          ? maxPrice
          : this.chartData.priceMaxValue;
      this.chartData.priceMinValue =
        minPrice < this.chartData.priceMinValue
          ? minPrice
          : this.chartData.priceMinValue;

      priceHistory.sort((a, b) => {
        return +new Date(a.date) - +new Date(b.date);
      });
      let maxDate = parseInt(
        moment(
          priceHistory[priceHistory.length - 1].date,
          'MM/DD/YYYY hh:mm:ss A'
        ).format('x')
      );
      let minDate = parseInt(
        moment(priceHistory[0].date, 'MM/DD/YYYY hh:mm:ss A').format('x')
      );
      if (!this.chartData.maxDateValue) {
        this.chartData.maxDateValue = maxDate;
      }
      if (!this.chartData.minDateValue) {
        this.chartData.minDateValue = minDate;
      }
      this.chartData.maxDateValue =
        maxDate > this.chartData.maxDateValue
          ? maxDate
          : this.chartData.maxDateValue;
      this.chartData.minDateValue =
        minDate < this.chartData.minDateValue
          ? minDate
          : this.chartData.minDateValue;

      let flag = false;
      if (this.exportToExcelArr.length === 0) {
        this.exportToExcelArr = priceHistory.map(x => {
          let tempExcelJson: any = {};
          tempExcelJson.date = moment(x.date, 'MM/DD/YYYY hh:mm:ss A').format(
            'MM/DD/YYYY'
          );
          tempExcelJson.price = x.price;
          return tempExcelJson;
        });
        flag = true;
      }

      priceHistory.forEach(price => {
        if (flag === false) {
          let exportExcelJson = this.exportToExcelArr.find(x => {
            return (
              moment(price.date, 'MM/DD/YYYY hh:mm:ss A').format(
                'MM/DD/YYYY'
              ) == x.date
            );
          });
          if (exportExcelJson) {
            exportExcelJson.price = price.price;
          } else {
            let newExportExcelJson: any = {};
            newExportExcelJson.date = moment(
              price.date,
              'MM/DD/YYYY hh:mm:ss A'
            ).format('MM/DD/YYYY');
            newExportExcelJson.price = price.price;
            this.exportToExcelArr.push(newExportExcelJson);
          }
        }
        let priceSubArr = [
          parseInt(moment(price.date, 'MM/DD/YYYY hh:mm:ss A').format('x')),
          price.price
        ];
        this.priceHistoryArr.push(priceSubArr);
      });
    }

    return this.positionService.getPositionChart(this.securityId);
  }

  getLatestComparisonPriceArr(
    comparisonPriceArr,
    priceHistoryArr,
    positionArr
  ) {
    // console.log(chartData);

    comparisonPriceArr.unshift(
      {
        key: 'Position',
        bar: true,
        values: positionArr
      },
      {
        key: 'Price',
        values: priceHistoryArr
      }
    );
    if (
      priceHistoryArr &&
      positionArr &&
      priceHistoryArr.length > 0 &&
      positionArr.length > 0
    ) {
      comparisonPriceArr.forEach(comparisonPriceJson => {
        if (
          this.chartData.maxDateValue >
          comparisonPriceJson.values[comparisonPriceJson.values.length - 1][0]
        ) {
          let maxDateFrom = moment(
            comparisonPriceJson.values[comparisonPriceJson.values.length - 1][0]
          ).format('MM/DD/YYYY');
          let maxDateTo = moment(this.chartData.maxDateValue).format(
            'MM/DD/YYYY'
          );
          let maxDurationInDays = moment(maxDateTo).diff(
            moment(maxDateFrom),
            'days'
          );
          for (let j = 1; j <= maxDurationInDays; j++) {
            comparisonPriceJson.values.push([
              parseInt(
                moment(maxDateFrom)
                  .add(j, 'days')
                  .format('x')
              ),
              '0'
            ]);
          }
          comparisonPriceJson.values.push([this.chartData.maxDateValue, '0']);
        }
        if (this.chartData.minDateValue < comparisonPriceJson.values[0][0]) {
          let dateTo = moment(comparisonPriceJson.values[0][0]).format(
            'MM/DD/YYYY'
          );
          let dateFrom = moment(this.chartData.minDateValue).format(
            'MM/DD/YYYY'
          );
          let durationInDays = moment(dateTo).diff(moment(dateFrom), 'days');
          for (let i = durationInDays; i >= 0; i--) {
            comparisonPriceJson.values.unshift([
              parseInt(
                moment(dateFrom)
                  .add(i - 1, 'days')
                  .format('x')
              ),
              '0'
            ]);
          }
          comparisonPriceJson.values.unshift([
            this.chartData.minDateValue,
            '0'
          ]);
        }
      });
    }

    this.priceData = comparisonPriceArr[1].values.map(price => {
      let newPrice: any = {};
      newPrice.y = parseInt(price[1]);
      newPrice.x = moment(price[0]).format('MM/DD/YYYY');
      return newPrice;
    });

    this.positionData = comparisonPriceArr[0].values.map(position => {
      let newPosition: any = {};
      newPosition.y = parseInt(position[1]);
      newPosition.x = moment(position[0]).format('MM/DD/YYYY');
      return newPosition;
    });

    let maxDates: string[];
    if (
      comparisonPriceArr[0].values.length > comparisonPriceArr[1].values.length
    ) {
      maxDates = comparisonPriceArr[0].values;
    } else {
      maxDates = comparisonPriceArr[1].values;
    }

    this.positionPriceDates = maxDates.map(x => {
      return moment(x[0]).format('MM/DD/YYYY');
    });

    this.positionPriceStep = Math.round(this.positionPriceDates.length / 10);
  }

  formatPrices(params): string {
    if (params && params.value) {
      return `$${params.value}`;
    } else {
      return '';
    }
  }

  getNumberWithCommas(params) {
    if (params && params.value) {
      return params.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    } else {
      return '';
    }
  }

  preparePositionChartDataAndRenderGraph(positionRes) {
    if (positionRes && positionRes.length > 0) {
      let positionMinMaxArray = positionRes;
      positionMinMaxArray.sort((a, b) => {
        return a.quantity - b.quantity;
      });
      this.chartData.positionMaxValue =
        positionMinMaxArray[positionMinMaxArray.length - 1].quantity;
      this.chartData.positionMinValue = positionMinMaxArray[0].quantity;

      if (this.chartData.positionMinValue == this.chartData.positionMaxValue) {
        this.chartData.positionMinValue = 0;
        this.chartData.positionMaxValue = this.chartData.positionMaxValue * 2;
      }
      positionRes.sort((a, b) => {
        return +new Date(a.date) - +new Date(b.date);
      });
      let maxDate = parseInt(
        moment(
          positionRes[positionRes.length - 1].date,
          'MM/DD/YYYY hh:mm:ss A'
        ).format('x')
      );
      let minDate = parseInt(
        moment(positionRes[0].date, 'MM/DD/YYYY hh:mm:ss A').format('x')
      );
      if (!this.chartData.maxDateValue) {
        this.chartData.maxDateValue = maxDate;
      }
      if (!this.chartData.minDateValue) {
        this.chartData.minDateValue = minDate;
      }
      this.chartData.maxDateValue =
        maxDate > this.chartData.maxDateValue
          ? maxDate
          : this.chartData.maxDateValue;
      this.chartData.minDateValue =
        minDate < this.chartData.minDateValue
          ? minDate
          : this.chartData.minDateValue;

      this.exportToExcelArr.forEach(excelJson => {
        positionRes.forEach(positionJson => {
          if (
            moment(positionJson.date, 'MM/DD/YYYY hh:mm:ss A').format(
              'MM/DD/YYYY'
            ) == excelJson.date
          ) {
            excelJson.position = positionJson.quantity;
          }
        });
      });

      positionRes.forEach(position => {
        let positionSubArr = [
          parseInt(moment(position.date, 'MM/DD/YYYY hh:mm:ss A').format('x')),
          position.quantity
        ];
        this.positionArr.push(positionSubArr);
      });
    }

    this.exportToExcelArr.sort((a, b) => {
      return +new Date(a.date) - +new Date(b.date);
    });

    this.exportToExcelDataList = this.exportToExcelArr;
    this.getLatestComparisonPriceArr(
      this.comparisonPriceArr,
      this.priceHistoryArr,
      this.positionArr
    );
    this.spinner.stop();
  }

  downloadExcel(): void {
    this.exportCollectionToCSV(this.exportToExcelDataList, 'position-vs-price');
  }

  private exportCollectionToCSV(collection: any[], fileName: string): void {
    if (!collection || !collection.length || !fileName) {
      return;
    }
    const headers = Object.keys(collection[0])
      .map(key => key.toUpperCase())
      .join();
    const csvCollection = collection.map(item =>
      Object.keys(item)
        .map(key => item[key])
        .join()
    );
    const csvContent = [headers, ...csvCollection].join('\r\n');
    const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvContent}`);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${fileName}.csv`);
    link.click();
  }
}
