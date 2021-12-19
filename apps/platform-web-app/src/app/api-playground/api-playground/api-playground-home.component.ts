import { Component, OnInit } from '@angular/core';

import {
  PinnaklSpinner,
  Toastr,
  WebServiceProvider
} from '@pnkl-frontend/core';
import { AccountService } from '@pnkl-frontend/shared';

@Component({
  selector: 'api-playground-home',
  templateUrl: './api-playground-home.component.html',
  styleUrls: ['./api-playground-home.component.scss']
})
export class ApiPlaygroundHomeComponent implements OnInit {
  count = 0;
  apiActionError = false;
  apiActionResult: any = {};
  from = 20;
  to = 40;
  constructor(
    private pinnaklSpinner: PinnaklSpinner,
    private wsp: WebServiceProvider,
    private toastr: Toastr,
    private accountsService: AccountService
  ) {}

  async doSomething(): Promise<void> {
    this.accountsService.getAccounts().
    then(result => {
      this.apiActionResult = result;
    });


  }

  private async bulkContactsUpload(): Promise<any> {
    // const result: any[] = await this.wsp.get({
    //   endPoint: 'trade_requests',
    //   options: {
    //     fields: [
    //       'tradeid',
    //       'securityId',
    //       'securityMarketId',
    //       'tranType',
    //       'tradeDate',
    //       'settleDate',
    //       'assetType',
    //       'trsIndicator',
    //       'ticker',
    //       'cusip',
    //       'identifier',
    //       'description',
    //       'quantity',
    //       'price',
    //       'currency',
    //       'fxrate',
    //       'commission',
    //       'secfee',
    //       'optionfee',
    //       'accruedInterest',
    //       'netMoneyLocal',
    //       'brokerId',
    //       'brokerName',
    //       'allocationsIndicator',
    //       'allocationId',
    //       'psetid',
    //       'customattribId',
    //       'counterpartyId',
    //       'comments',
    //       'approverMessage'
    //     ],
    //     filters: [
    //       {
    //         key: '',
    //         type: 'RANGE',
    //         value: [this.from.toString(), this.to.toString()]
    //       }
    //     ],
    //     orderBy: [
    //       {
    //         field: 'tradedate',
    //         direction: 'DESC'
    //       }
    //     ]
    //   }
    // });
    // return {
    //   length: result.length,
    //   items: result
    // };
  }

  private async performAsyncAction(action: () => Promise<any>): Promise<void> {
    try {
      this.pinnaklSpinner.spin();
      this.apiActionResult = await action();
      this.apiActionError = false;
    } catch (e) {
      this.apiActionResult = e;
      this.apiActionError = true;
    } finally {
      this.pinnaklSpinner.stop();
    }
  }
}
