import { Component, Input, OnInit } from '@angular/core';
import { PinnaklSpinner } from '@pnkl-frontend/core';
import { PositionService, Security } from '@pnkl-frontend/shared';
import * as _ from 'lodash';
import * as moment from 'moment';
declare let d3: any;

@Component({
  selector: 'price-comparison',
  templateUrl: './price-comparison.component.html'
})
export class PriceComparisonComponent implements OnInit {
  private readonly dateFormat = 'MM/DD/YYYY';
  private readonly longDateFormat = 'MM/DD/YYYY hh:mm:ss A';
  @Input() securityId: number;
  @Input() securities: Security[];
  selectedSecurities: Security[] = [];
  priceHistoryArr: any = [];
  exportToExcelArr: any = [];
  chartData: any = {};
  excelBtnColumnNames: any = {
    date: 'Date',
    price: 'Price'
  };
  tempSelSecurity = [];
  priceComparisonData: any;
  showGraph = true;
  priceDates: any[];
  priceStep: number;

  readonly virtualSettings = { itemHeight: 28 };

  constructor(
    private readonly spinner: PinnaklSpinner,
    private readonly positionService: PositionService
  ) { }

  ngOnInit(): void {
    this.spinner.spin();
    this.loadGraphForSingleSecurity();
  }

  valueChange(value: any): void {
    this.spinner.spin();
    this.selectedSecurities = value;
    this.showGraph = false;
    if (this.selectedSecurities.length > this.tempSelSecurity.length) {
      const securityAdded = _.differenceBy(
        this.selectedSecurities,
        this.tempSelSecurity,
        'id'
      );
      this.addSecurityInGraph(securityAdded[0]);
    } else if (this.tempSelSecurity.length > this.selectedSecurities.length) {
      const securityRemoved = _.differenceBy(
        this.tempSelSecurity,
        this.selectedSecurities,
        'id'
      );
      this.removeSecurityFromGraph(securityRemoved[0]);
    }
  }

  formatPrices(params: any): string {
    if (params && params.value) {
      return `$${params.value}`;
    } else {
      return '';
    }
  }

  removeSecurityFromGraph(security: any): void {
    this.priceComparisonData.forEach((data, index) => {
      if (data.key === security.ticker) {
        this.priceComparisonData.splice(index, 1);
      }
    });
    this.tempSelSecurity = this.selectedSecurities.map(x => x);
    // if all securities are removed - initial data should be received again.
    if (this.selectedSecurities.length === 0) {
      this.loadGraphForSingleSecurity();
    } else {
      setTimeout(() => this.showGraph = true, 10);
      this.spinner.stop();
    }
  }

  addSecurityInGraph(security: any): void {
    this.positionService
      .getPriceHistoryChart(security.id)
      .then((priceHistory: { date: string, price: string }[]) => {
        if (priceHistory && priceHistory.length > 0) {
          const priceMinMaxArray = priceHistory;

          priceMinMaxArray.sort((a, b) => +(a.price) - +(b.price));
          const maxPrice = parseInt(
            priceMinMaxArray[priceMinMaxArray.length - 1].price
          );
          const minPrice = parseInt(priceMinMaxArray[0].price);
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

          priceHistory.sort((a, b) => +new Date(a.date) - +new Date(b.date));
          const maxDate = parseInt(
            moment(priceHistory[priceHistory.length - 1].date, this.longDateFormat).format('x')
          );
          const minDate = parseInt(
            moment(priceHistory[0].date, this.longDateFormat).format('x')
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

          this.excelBtnColumnNames[security.ticker] = security.ticker;
          let flag = false;
          if (this.exportToExcelArr.length === 0) {
            this.exportToExcelArr = priceHistory.map(x => {
              const tempExcelJson: any = {};
              tempExcelJson.date = moment(x.date, this.longDateFormat).format(this.dateFormat);
              tempExcelJson.price = 0;
              tempExcelJson.position = 0;
              tempExcelJson[security.ticker] = x.price;
              return tempExcelJson;
            });
            flag = true;
          }

          priceHistory.forEach(price => {
            if (flag === false) {
              const exportExcelJson = this.exportToExcelArr.find(x =>
                moment(price.date, this.longDateFormat).format(this.dateFormat) === x.date);
              if (exportExcelJson) {
                exportExcelJson[security.ticker] = price.price;
              } else {
                // var newExportExcelJson = {};
                // newExportExcelJson.date = moment(price.date, 'MM/DD/YYYY hh:mm:ss A').format('MM/DD/YYYY');
                // newExportExcelJson.price = 0;
                // newExportExcelJson.position = 0;
                // for (var k = index; k >= 1; k--) {
                //     newExportExcelJson[vm.comparisonSecurities[index - parseInt(k)].ticker] = 0;
                // }
                // newExportExcelJson[security.ticker] = price.price;
                // exportToExcelArr.push(newExportExcelJson);
              }
            }
          });

          priceHistory = priceHistory.map(x => {
            x.date = moment(x.date, this.longDateFormat).format(this.dateFormat);
            return x;
          });

          this.priceComparisonData.push({
            key: security.ticker,
            values: priceHistory
          });

          const recalculationResult = this.filterPriceComparisonDataAccordingToTheDatesForEachKeys(this.priceComparisonData);
          this.chartData.minDateValue = parseInt(moment(recalculationResult.latestOfEarliestDate, this.longDateFormat).format('x'));
          this.priceComparisonData = recalculationResult.data;

          this.priceComparisonData.forEach(comparisonPriceJson => {
            if (
              this.chartData.maxDateValue >
              parseInt(moment(comparisonPriceJson.values[comparisonPriceJson.values.length - 1].date).format('x'))
            ) {
              const maxDateFrom = moment(
                comparisonPriceJson.values[
                  comparisonPriceJson.values.length - 1
                ].date
              ).format(this.dateFormat);
              const maxDateTo = moment(this.chartData.maxDateValue).format(this.dateFormat);
              const maxDurationInDays = moment(maxDateTo).diff(moment(maxDateFrom), 'days');
              for (let j = 1; j <= maxDurationInDays; j++) {
                comparisonPriceJson.values.push({
                  date: moment(maxDateFrom).add(j, 'days').format(this.dateFormat),
                  price: 0
                });
              }
              comparisonPriceJson.values.push({
                date: moment(this.chartData.maxDateValue).format(this.dateFormat),
                price: 0
              });
            }
            if (
              this.chartData.minDateValue <
              parseInt(moment(comparisonPriceJson.values[0].date).format('x'))
            ) {
              const dateTo = moment(comparisonPriceJson.values[0].date).format(this.dateFormat);
              const dateFrom = moment(this.chartData.minDateValue).format(this.dateFormat);
              const durationInDays = moment(dateTo).diff(
                moment(dateFrom),
                'days'
              );
              for (let i = durationInDays; i >= 0; i--) {
                comparisonPriceJson.values.unshift({
                  date: moment(dateFrom).add(i - 1, 'days').format(this.dateFormat),
                  price: 0
                });
              }
              comparisonPriceJson.values.unshift({
                date: moment(this.chartData.minDateValue).format(this.dateFormat),
                price: 0
              });
            }
          });

          let maxDates: any[] = this.priceComparisonData[0].values;
          for (let n = 0; n < this.priceComparisonData.length - 1; n++) {
            if (
              this.priceComparisonData[n + 1].values.length >
              this.priceComparisonData[n].values.length
            ) {
              maxDates = this.priceComparisonData[n + 1].values;
            }
          }

          this.priceDates = maxDates.map(x => moment(x.date).format(this.dateFormat));

          this.priceStep = Math.round(this.priceDates.length / 10);
        }
        this.tempSelSecurity = this.selectedSecurities.map(x => x);
        this.showGraph = true;
        this.spinner.stop();
      });
  }

  loadGraphForSingleSecurity(): void {
    this.positionService
      .getPriceHistoryChart(this.securityId)
      .then(this.preparePriceHistoryChartDataAndRenderGraph.bind(this));
  }

  preparePriceHistoryChartDataAndRenderGraph(priceHistory: { date: string, price: string }[]): void {
    if (priceHistory && priceHistory.length > 0) {
      // console.log(priceHistory);
      const priceMinMaxArray = priceHistory;
      priceMinMaxArray.sort((a, b) => +(a.price) - +(b.price));
      const maxPrice = parseInt(
        priceMinMaxArray[priceMinMaxArray.length - 1].price
      );
      const minPrice = parseInt(priceMinMaxArray[0].price);
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

      priceHistory.sort((a, b) => +new Date(a.date) - +new Date(b.date));
      const maxDate = parseInt(
        moment(priceHistory[priceHistory.length - 1].date, this.longDateFormat).format('x')
      );
      const minDate = parseInt(
        moment(priceHistory[0].date, this.longDateFormat).format('x')
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
          const tempExcelJson: any = {};
          tempExcelJson.date = moment(x.date, this.longDateFormat).format(this.dateFormat);
          tempExcelJson.price = x.price;
          return tempExcelJson;
        });
        flag = true;
      }

      priceHistory.forEach(price => {
        if (flag === false) {
          const exportExcelJson = this.exportToExcelArr.find(x =>
            moment(price.date, this.longDateFormat).format(this.dateFormat) === x.date);
          if (exportExcelJson) {
            exportExcelJson.price = price.price;
          } else {
            const newExportExcelJson: any = {};
            newExportExcelJson.date = moment(
              price.date,
              this.longDateFormat
            ).format(this.dateFormat);
            newExportExcelJson.price = price.price;
            this.exportToExcelArr.push(newExportExcelJson);
          }
        }
      });

      priceHistory = priceHistory.map(x => {
        x.date = moment(x.date, this.longDateFormat).format(this.dateFormat);
        return x;
      });
      this.priceHistoryArr = priceHistory;
    }

    this.spinner.stop();
    this.loadGraphData();
  }

  loadGraphData(): void {
    this.priceComparisonData = [
      {
        key: 'Price',
        values: this.priceHistoryArr
      }
    ];

    this.priceDates = this.priceHistoryArr.map(x => x.date);

    this.priceStep = Math.round(this.priceDates.length / 10);
  }

  private filterPriceComparisonDataAccordingToTheDatesForEachKeys(priceComparisonData:
    {
      key: string, values: {
        date: string;
        price: string | number;
      }[]
    }[]): {
      data: {
        key: string;
        values: {
          date: string;
          price: string | number;
        }[];
      }[];
      latestOfEarliestDate: string;
    } {
    const sortFunc = (a: string, b: string) => (+new Date(a)) - (+new Date(b));

    const clonedInitialData = _.cloneDeep(priceComparisonData);
    // Initial key - values should be skipped in process of found the earliestDates for a new security selection.
    // const clonedInitialDataWihtoutInitial = cloneDeep(priceComparisonData.slice(1));

    const keyEarliestDate: { [key: string]: string } = {};

    // method to find the earliest date within one security
    const getTheEarliestDate = (values: { date: string; price: string | number; }[]): string => {
      const sortedByDate = values.sort((a, b) => sortFunc(a.date, b.date));
      return moment(sortedByDate[0].date).format(this.dateFormat);
    };

    // Go through initial data and create a key - earliest date map.
    for (const iterator of clonedInitialData) {
      keyEarliestDate[iterator.key] = getTheEarliestDate(iterator.values);
    }

    // Go through all the earliest dates across all securities and found the biggest.
    const dates = Object.values(keyEarliestDate);
    const theLatestOfEarliestDate = dates.sort((a, b) => sortFunc(a, b))[dates.length - 1];

    // filter the data with a condition that date should be the same of after (bigger/later) than theLatestOfEarliestDates.
    clonedInitialData.forEach(value => {
      for (const [key] of Object.entries(keyEarliestDate)) {
        if (value.key === key) {
          value.values = value.values.filter(item =>
            moment(moment(item.date).format(this.dateFormat)).isSameOrAfter(moment(theLatestOfEarliestDate).format(this.dateFormat)));
        }
      }
    });

    return {
      data: clonedInitialData,
      latestOfEarliestDate: theLatestOfEarliestDate
    };
  }
}
