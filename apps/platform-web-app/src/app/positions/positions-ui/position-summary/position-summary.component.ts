import { Component, Input, OnInit } from '@angular/core';

import { chain, find, some } from 'lodash';
import * as moment from 'moment';

import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { PinnaklSpinner } from '@pnkl-frontend/core';
import { PositionService, PricingService } from '@pnkl-frontend/shared';

@Component({
  selector: 'position-summary',
  templateUrl: './position-summary.component.html',
  styleUrls: ['./position-summary.component.scss']
})
export class PositionSummaryComponent implements OnInit {
  @Input() posDate: any;
  @Input() accounts: any;
  @Input() securityId: number;
  posJson: any = {};
  pnlValues = [];
  mtdPnl: number;
  itdPnl: number;
  ytdPnl: number;
  totalPosition: number;
  latestPricingDate: any;
  latestPnlDate: any;
  formattedPosSummary: any;
  custodianHeaderArr: any = [];
  lastPrice: any;
  sharesCalcForm: FormGroup;
  calcShares = 0;

  constructor(
    private readonly positionService: PositionService,
    private readonly pricingService: PricingService,
    private readonly spinner: PinnaklSpinner,
    private readonly fb: FormBuilder,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.spinner.spin();
    this.pricingService
      .getLatestPricingDate(this.posDate)
      .then(this.assignLatestPricingDateAndExecutePositionSummary.bind(this))
      .then(this.executeRenderPositionSummary.bind(this));

    this.sharesCalcForm = this.fb.group({
      targetPct: [],
      sharesCalc: []
    });
  }

  assignLatestPricingDateAndExecutePositionSummary(
    latestPricingDate: any
  ): any {
    this.posJson.latestPricingDate = latestPricingDate;
    return this.positionService.getPositionSummary(
      this.securityId,
      moment(this.posDate, 'MM/DD/YYYY').format('YYYYMMDD')
    );
  }

  executeRenderPositionSummary(positionSummaryRes: any): void {
    if (this.doesPositionSummaryExists(positionSummaryRes)) {
      this.renderPositionSummary(positionSummaryRes);
    }
    this.spinner.stop();
  }

  doesPositionSummaryExists(positionSummary: any[]): boolean {
    return positionSummary.length > 0;
  }

  renderPositionSummary(positionSummaryRes: any): void {
    // this.spinner.stop();
    const posSummaryData =
      this.getPositionSummaryDataForRendering(positionSummaryRes);
    this.latestPricingDate = moment(
      this.posJson.latestPricingDate,
      'MM/DD/YYYY hh:mm:ss a'
    ).format('MM/DD/YYYY');

    this.totalPosition = posSummaryData.totalPosition;
    this.formattedPosSummary = posSummaryData.formattedPosSummary;
    this.custodianHeaderArr = posSummaryData.custodianHeaderArr;
    this.lastPrice = parseFloat(positionSummaryRes[0].Cost);
  }

  getPositionSummaryDataForRendering(positionSummary: any): any {
    const custodianHeaderArr = this.getCustodians(positionSummary);
    const totPos = chain(positionSummary)
      .map(p => (p.Position = parseFloat(p.Position)))
      .sum()
      .value();

    const formattedPosSummary =
      this.getFormattedPositionSummaryWithTotalPositions(positionSummary);
    return {
      totalPosition: totPos,
      formattedPosSummary: formattedPosSummary,
      custodianHeaderArr: custodianHeaderArr
    };
  }

  getFormattedPositionSummaryWithTotalPositions(positionSummary: any): any {
    const formattedPosSummary =
      this.getFormattedPositionSummaryInfo(positionSummary);
    const formattedPosSummaryWithTotalPositions =
      this.addTotalPositionsToFormattedSummary(formattedPosSummary);
    const positionSummaryWithOrderOfImportance = this.addOrderOfImportance(
      formattedPosSummaryWithTotalPositions
    );
    positionSummaryWithOrderOfImportance.sort((a, b) =>
      a.orderOfImportance > b.orderOfImportance
        ? 1
        : b.orderOfImportance > a.orderOfImportance
        ? -1
        : 0
    );
    return positionSummaryWithOrderOfImportance;
  }

  addOrderOfImportance(positionSummary: any): any {
    positionSummary.forEach(posSummary => {
      this.accounts.forEach(account => {
        if (account.accountcode === posSummary.AccountCode) {
          posSummary.orderOfImportance = account.orderofimportance;
        }
      });
    });
    return positionSummary;
  }

  doesArrayContainObjectValue(arr: any[], ...comparisonArr: any): any {
    let result = false;
    arr.forEach(arrJson => {
      const keys = Object.keys(arrJson);
      keys.forEach(key => {
        comparisonArr.forEach(comparisonJson => {
          if (
            key === comparisonJson.prop &&
            arrJson[key] === comparisonJson.value
          ) {
            result = true;
          }
        });
      });
    });
    return result;
  }

  private isFloat(n: string): boolean {
    return parseFloat(n) % 1 !== 0;
  }

  getArrayIndex(
    key1: string,
    value1: any,
    key2: string,
    value2: any,
    arr: any[]
  ): number {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i][key1] === value1 && arr[i][key2] === value2) {
        return i;
      }
    }
    return -1;
  }

  addTotalPositionsToFormattedSummary(positionSummary: any): any {
    positionSummary.forEach(summaryJson => {
      summaryJson.totalPosition = 0;
      if (summaryJson.custodians.length > 1) {
        summaryJson.displayTotalPosition = true;
      } else {
        summaryJson.displayTotalPosition = false;
      }
      summaryJson.custodians.forEach(custodian => {
        summaryJson.totalPosition =
          summaryJson.totalPosition + parseInt(custodian.position);
      });
    });
    return positionSummary;
  }

  getCustodians(posSummary: any): any {
    const posSummarylist = posSummary;
    const custodianArr = [];
    posSummarylist.forEach(posSummaryJson => {
      // if ($filter('filter')(custodianArr, {
      //     'custodian': posSummaryJson.CustodianCode
      // }, true).length === 0) {

      if (
        !this.doesArrayContainObjectValue(custodianArr, {
          prop: 'custodian',
          value: posSummaryJson.CustodianCode
        })
      ) {
        custodianArr.push({
          custodian: posSummaryJson.CustodianCode
        });
      }
    });
    return custodianArr;
  }

  doesTradeDateExists(tradeDate: any): boolean {
    return tradeDate && tradeDate.length > 0;
  }

  doesLatestPricingDateExists(latestPricingDate: any): boolean {
    if (latestPricingDate) {
      return true;
    }
    return false;
  }

  private getFormattedPositionSummaryInfo(positionSummary: any): any[] {
    const formattedPositionSummary = [];
    positionSummary.forEach(posSummary => {
      if (
        !some(formattedPositionSummary, {
          AccountCode: posSummary.AccountCode
        })
      ) {
        formattedPositionSummary.push(this.getNewAccountRow(posSummary));
      } else {
        this.addCustodianAndPositions(
          find(formattedPositionSummary, {
            AccountCode: posSummary.AccountCode
          }),
          posSummary
        );
      }
    });
    return formattedPositionSummary;
  }

  private addCustodianAndPositions(accountRow: any, posSummary: any): void {
    let position: number;
    if (this.isFloat(posSummary.Position)) {
      position = parseFloat(posSummary.Position.toFixed(2));
    } else {
      position = parseInt(posSummary.Position);
    }

    accountRow.totalPosition += position;
    const existingCustodian: any = find(accountRow.custodian, {
      custodianCode: posSummary.CustodianCode
    });
    if (existingCustodian) {
      existingCustodian.position += position;
    } else {
      accountRow.custodians.push({
        custodian: posSummary.CustodianCode,
        position
      });
    }
    accountRow.marketValue += parseFloat(
      parseFloat(posSummary.MVUSD).toFixed(2)
    );
    accountRow.aumPercent += parseFloat(
      parseFloat(posSummary.MVUSDPct).toFixed(2)
    );
  }

  private getNewAccountRow(posSummary: any): any {
    const accountRow = {} as any;
    let position: number;
    accountRow.AccountCode = posSummary.AccountCode;
    if (this.isFloat(posSummary.Position)) {
      position = parseFloat(posSummary.Position.toFixed(2));
    } else {
      position = parseInt(posSummary.Position);
    }
    accountRow.custodians = [{ custodian: posSummary.CustodianCode, position }];
    accountRow.totalPosition = position;
    accountRow.marketValue = parseFloat(
      parseFloat(posSummary.MVUSD).toFixed(2)
    );
    accountRow.aumPercent = parseFloat(
      parseFloat(posSummary.MVUSDPct).toFixed(2)
    );
    return accountRow;
  }

  calcQuantity(): void {
    const tgtPct = +this.sharesCalcForm.controls['targetPct'].value;
    const currentPct = this.formattedPosSummary[0]['aumPercent'];
    const currentShares = this.formattedPosSummary[0]['totalPosition'];

    console.log('currentPct', currentPct);
    console.log('currentShares', currentShares);
    const newShares = Math.ceil(
      ((currentShares * tgtPct) / (currentPct * 100)) * 100
    );

    this.calcShares = newShares - currentShares;
    this.sharesCalcForm.patchValue({
      sharesCalc: newShares - currentShares
    });
  }

  openTrade(): void {
    const shares = +this.sharesCalcForm.controls['sharesCalc'].value;
    const url = `#/oms/new-trade;assetType=equity;securityid=${this.securityId};quantity=${shares}`;
    console.log('opening url', url);
    window.open(url, '_blank');
  }
}
