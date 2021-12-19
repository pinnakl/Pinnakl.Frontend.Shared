import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import { PnklComparisonAxisData } from '@pnkl-frontend/pnkl-charts';
import { Subject } from "rxjs";

import { takeUntil } from "rxjs/operators";

import { Account } from "../../models/account.model";
import { PositionService } from '../../pinnakl-web-services/position.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'position-and-price-graph',
  templateUrl: './position-and-price.component.html'
})
export class PositionAndPriceGraphComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  @Input() securityId: number;

  positionsChartData: { date: Date; value: number; showAsFlag?: boolean }[];
  allPositionsChartData: any[];
  priceChartData: { date: Date; value: number }[];

  constructor(
    private readonly positionService: PositionService,
    private readonly spinner: PinnaklSpinner
  ) {
    this.positionService.selectedPositionPopupAccount$.pipe(
      takeUntil(this.destroy$),
    ).subscribe((account: Account) => {
      // In the case account has id (filter selected) - the positions chart data should be filtered by account id.
      if (account && account.id) {
        const filteredPositionsChartDataByAccountId =
          this.allPositionsChartData.filter(value => value.accountid === account?.id);
        this.positionsChartData = this.formatPositionChartData(filteredPositionsChartDataByAccountId);
      } else {
        // In the case account hasn't id - the positions chart data should be initial one from API.
        this.positionsChartData = this.formatPositionChartData(this.allPositionsChartData);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    this.spinner.spin();
    const chartData = await Promise.all([
      this.positionService.getPriceHistoryChart(this.securityId),
      this.positionService.getPositionChart(this.securityId)
    ]);
    this.allPositionsChartData = chartData[1];
    this.positionsChartData = this.formatPositionChartData(chartData[1]);
    this.priceChartData = this.formatPriceChartData(chartData[0]);
    this.spinner.stop();
    this.setSelectedAccount();
  }

  private setSelectedAccount(): void {
    this.positionService.selectedPositionPopupAccount$.subscribe((account) => {
      if (account) {
        this.positionsChartData = this.formatPositionChartData(this.allPositionsChartData.filter(el => el.accountid === account.id));
      } else {
        this.positionsChartData = this.formatPositionChartData(this.allPositionsChartData);
      }
    });
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
