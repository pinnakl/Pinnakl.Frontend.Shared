import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PinnaklSpinner } from '@pnkl-frontend/core';
import { AccountService, SecurityService } from '@pnkl-frontend/shared';

import { cloneDeep } from 'lodash';
import * as moment from 'moment';
import { EMPTY, forkJoin, from, Subscription } from 'rxjs';
import { catchError, filter } from 'rxjs/operators';

import { PositionPopupAltComponent } from './positions/positions-ui/position-popup-alt';
import { SecurityItem } from '../../../../libs/shared/src/lib/pinnakl-ui/security-items/security-item.model';
import { WideSearchComponent } from '../../../../libs/shared/src/lib/pinnakl-ui/wide-search/wide-search.component';

@Injectable()
export class NavBarService {
  private positionSummarySubscription: Subscription;

  constructor(
    private readonly dialog: MatDialog,
    private readonly accountService: AccountService,
    private readonly securityService: SecurityService,
    private readonly spinner: PinnaklSpinner) { }

  searchModalOpen(): void {
    const dialogRef = this.dialog.open<WideSearchComponent, MatDialogConfig, { event: SecurityItem }>(
      WideSearchComponent,
      {
        width: '632px',
        maxWidth: '650px',
        height: '611px',
        maxHeight: '650px',
        autoFocus: true,
        disableClose: true,
        panelClass: 'modal-dialog-radius-12'
      }
    );

    dialogRef.afterClosed().pipe(
      filter((v) => !!v.event)
    ).subscribe((v: { event: SecurityItem }) => this.openPositionSummaryDialog(v.event));
  }

  private openPositionSummaryDialog(item: SecurityItem): void {
    this.spinner.spin();
    if (this.positionSummarySubscription) {
      this.positionSummarySubscription.unsubscribe();
    }

    const accounts$ = from(this.accountService.getAccounts());
    const securities$ = from(this.securityService.getAllSecurities());
    const security$ = from(this.securityService.getSecurity(item.securityId));

    this.positionSummarySubscription = forkJoin([accounts$, securities$, security$]).pipe(
      catchError(() => {
        this.spinner.stop();
        return EMPTY;
      })
    ).subscribe(result => {
      const [accounts, securities, security] = result;
      const dialogRef = this.dialog.open<PositionPopupAltComponent, MatDialogConfig>(
        PositionPopupAltComponent,
        {
          width: '60vw',
          maxWidth: '65vw'
        });
      dialogRef.componentInstance.securities = cloneDeep(securities);
      dialogRef.componentInstance.accounts = cloneDeep(accounts);
      dialogRef.componentInstance.securityId = item.securityId;
      dialogRef.componentInstance.underlyingSecId = security.underlyingsecid;
      dialogRef.componentInstance.posDate = moment().format('MM/DD/YYYY');
      this.spinner.stop();
      dialogRef.afterClosed().subscribe(type => {
        if (type === 'wide-modal') {
          this.searchModalOpen();
        }
      });
    });
  }

}
