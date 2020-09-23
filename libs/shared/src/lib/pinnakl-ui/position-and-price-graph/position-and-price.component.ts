import { Component, Input, OnInit } from '@angular/core';

import { PnklComparisonAxisData } from '@pnkl-frontend/pnkl-charts';
import { PinnaklSpinner } from '@pnkl-frontend/core';
import { PositionService } from '../../pinnakl-web-services/position.service';

@Component({
  selector: 'position-and-price-graph',
  templateUrl: './position-and-price.component.html'
})
export class PositionAndPriceGraphComponent implements OnInit {
  @Input() securityId: string;

  positionsChartData: { date: Date; value: number; showAsFlag?: boolean }[];
  priceChartData: { date: Date; value: number }[];

  constructor(
    private positionService: PositionService,
    private spinner: PinnaklSpinner
  ) {}

  async ngOnInit() {
    this.spinner.spin();
    const chartData = await Promise.all([
      this.positionService.getPriceHistoryChart(this.securityId),
      this.positionService.getPositionChart(this.securityId)
    ]);
    this.positionsChartData = this.formatPositionChartData(chartData[1]);
    this.priceChartData = this.formatPriceChartData(chartData[0]);
    this.spinner.stop();
  }

  formatPriceChartData(
    priceData: { date: string; price: string }[]
  ): { date: Date; value: number }[] {
    return priceData.map(priceRow => ({
      date: new Date(priceRow.date),
      value: +priceRow.price
    }));
  }

  formatPositionChartData(
    positionData: { date: string; quantity: string }[]
  ): PnklComparisonAxisData[] {
    let previousPositions = null;
    return positionData.map(positionRow => {
      const formattedRow = {
        date: new Date(positionRow.date),
        value: +positionRow.quantity,
        flagQuantity:
          previousPositions &&
          Math.abs(+positionRow.quantity - previousPositions) > 50000
            ? Math.abs(+positionRow.quantity - previousPositions)
            : null
      };
      previousPositions = +positionRow.quantity;
      return formattedRow;
    });
  }
}
