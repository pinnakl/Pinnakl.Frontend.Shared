import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';

import { FormBuilder, FormGroup } from '@angular/forms';
import { PinnaklSpinner, Toastr } from '@pnkl-frontend/core';
import { Account, Destroyable, PositionService } from '@pnkl-frontend/shared';
import { GridDataResult } from '@progress/kendo-angular-grid';
import {
  groupBy,
  GroupDescriptor,
  orderBy,
  SortDescriptor
} from '@progress/kendo-data-query';
import * as moment from 'moment';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'trade-history',
  templateUrl: './trade-history.component.html',
  styleUrls: ['./trade-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TradeHistoryComponent extends Destroyable implements OnChanges {
  @Input() secId: number;
  @Input() underlyingSecId: number;
  tradeHistory: Array<any>;
  sort: SortDescriptor[] = [];
  groups: GroupDescriptor[] = [];
  gridView: GridDataResult;
  historyForm: FormGroup;
  private accountId: string = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly spinner: PinnaklSpinner,
    private readonly positionService: PositionService,
    private readonly cdr: ChangeDetectorRef,
    private readonly toastr: Toastr
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.secId.firstChange) {
      this.watchSelectedAccount();
    }
  }

  private watchSelectedAccount(): void {
    this.positionService.selectedPositionPopupAccount$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((account: Account) => {
        this.accountId = account?.id;
        this.getTradeHistory();
        this.initHistoryForm();
      });
  }

  getTradeHistory(isUnderlyingEnabled: boolean = false): void {
    if (!this.accountId) {
      this.loadTradeHistory(
        this.secId,
        this.underlyingSecId,
        isUnderlyingEnabled
      );
    } else {
      this.loadTradeHistoryByAccount(
        this.secId,
        this.underlyingSecId,
        isUnderlyingEnabled,
        this.accountId
      );
    }
  }

  private loadTradeHistoryByAccount(
    secId: number,
    underlyingSecId: number,
    isUnderlyingEnabled: boolean,
    accId: string
  ): void {
    this.spinner.spin();
    this.positionService
      .getTradeAllocationsBySecurity(
        secId,
        underlyingSecId,
        isUnderlyingEnabled,
        accId
      )
      .then(tradeHistory =>
        this.handleSuccessOfTradeHistoryRequest(tradeHistory)
      )
      .catch((err: HttpErrorResponse) =>
        this.handleErrorOfTradeHistoryRequest(err)
      );
  }

  private loadTradeHistory(
    id: string | number = this.secId,
    underlyingSecId: number,
    isUnderlyingEnabled: boolean = false
  ): void {
    this.spinner.spin();
    this.positionService
      .getTradeHistory(id, underlyingSecId, isUnderlyingEnabled)
      .then(tradeHistory =>
        this.handleSuccessOfTradeHistoryRequest(tradeHistory)
      )
      .catch((err: HttpErrorResponse) =>
        this.handleErrorOfTradeHistoryRequest(err)
      );
  }

  private handleSuccessOfTradeHistoryRequest(tradeHistory: any): void {
    tradeHistory.sort(
      (a, b) => +new Date(b.tradedate) - +new Date(a.tradedate)
    );
    this.spinner.stop();
    tradeHistory = this.getParsedTradeHistory(tradeHistory);
    this.tradeHistory = tradeHistory;
    this.renderGrid();
  }

  private handleErrorOfTradeHistoryRequest(err: HttpErrorResponse): void {
    this.spinner.stop();
    this.toastr.error(err?.error?.message);
    console.error(err, 'Error while loadTradeHistory');
  }

  private getParsedTradeHistory(tradeHistory: any): void {
    return tradeHistory.map(tradeHistoryJson => {
      tradeHistoryJson.commission = parseFloat(tradeHistoryJson.commission);
      tradeHistoryJson.netmoneylocal = parseFloat(
        tradeHistoryJson.netmoneylocal
      );
      tradeHistoryJson.price = parseFloat(tradeHistoryJson.price);
      tradeHistoryJson.quantity = parseFloat(tradeHistoryJson.quantity);
      tradeHistoryJson.tradedate = moment(
        tradeHistoryJson.tradedate,
        'MM/DD/YYYY hh:mm:ss a'
      ).format('MM/DD/YYYY');
      tradeHistoryJson.trantype = this.getTranTypeLong(
        tradeHistoryJson.trantype
      );
      tradeHistoryJson.brokername = tradeHistoryJson?.brokername
        ? tradeHistoryJson.brokername
        : tradeHistoryJson?.executingbrokername;
      tradeHistoryJson.commissionpershare = tradeHistoryJson?.commissionpershare
        ? tradeHistoryJson.commissionpershare
        : tradeHistoryJson?.commpershare;
      return tradeHistoryJson;
    });
  }

  private renderGrid(): void {
    this.gridView = {
      data: orderBy(this.tradeHistory, this.sort),
      total: this.tradeHistory.length
    };
    this.cdr.detectChanges();
  }

  sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.renderGrid();
  }

  private renderGridAfterGrouping(): void {
    this.gridView = {
      data: groupBy(this.tradeHistory, this.groups),
      total: this.tradeHistory.length
    };
    this.cdr.detectChanges();
  }

  groupChange(groups: GroupDescriptor[]): void {
    this.groups = groups;
    this.renderGridAfterGrouping();
  }

  private initHistoryForm(): void {
    this.historyForm = this.fb.group({
      underlying: false
    });
    this.watchUnderlyingControl();
  }

  private watchUnderlyingControl(): void {
    this.historyForm
      .get('underlying')
      .valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((isUnderlyingEnabled: boolean) => {
        this.getTradeHistory(isUnderlyingEnabled);
      });
  }

  private getTranTypeLong(tranType: string): string {
    return {
      b: 'Buy',
      bc: 'Cover',
      s: 'Sell',
      ss: 'Short'
    }[tranType.toLowerCase()];
  }
}
