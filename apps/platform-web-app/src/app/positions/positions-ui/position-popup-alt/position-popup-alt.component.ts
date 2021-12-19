import { Component, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Account, Security } from '@pnkl-frontend/shared';

@Component({
  templateUrl: './position-popup-alt.component.html',
  styleUrls: ['./position-popup-alt.component.scss']
})
export class PositionPopupAltComponent {
  readonly tabs = [
    { caption: 'POSITION SUMMARY', name: 'positionSummaryTab' },
    { caption: 'TRADE HISTORY', name: 'tradeHistoryTab' },
    { caption: 'POSITION HISTORY', name: 'positionVsPriceTab' },
    { caption: 'PRICE COMPARISON', name: 'priceComparisonTab' }
  ];

  positionSummaryTab = true;
  tradeHistoryTab = false;
  positionVsPriceTab = false;
  priceComparisonTab = false;

  tabActive: string;

  checkAllTrades = false;
  @Input() accounts: Account[];
  @Input() securityId: number;
  @Input() underlyingSecId: number;
  @Input() securities: Security[];
  @Input() posDate: string;
  constructor(
    private readonly dialogRef: MatDialogRef<PositionPopupAltComponent>) {
    this.activateFirstTab();
  }

  private activateFirstTab(): void {
    this.tabActive = this.tabs[0].name;
  }

  activateTab(tabValue: string): void {
    this.tabActive = tabValue;
    this[tabValue] = true;
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  getCurrentSecutity() {
    return this.securities.find(el => el.id === this.securityId);
  }
  openWideSearch() {
    this.dialogRef.close('wide-modal');
  }
}

