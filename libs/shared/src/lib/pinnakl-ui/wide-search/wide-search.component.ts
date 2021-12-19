import { Component, HostListener, OnDestroy } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { from, of, Subject } from 'rxjs';
import { debounceTime, mergeMap, takeUntil, tap } from 'rxjs/operators';

import { SecurityService } from '../../..';
import { SecurityItem } from '../security-items/security-item.model';
import { SecurityMarketFlattened } from '../../models/security/security-market-flattened.model';

// eslint-disable-next-line no-shadow
enum SearchFilters {
  All = 'All',
  Equities = 'Equities',
  Option = 'Options',
  Future = 'Futures',
  Bonds = 'Bonds',
  Currency = 'Currency',
  Swaps = 'Swaps'
}

@Component({
  selector: 'pnkl-wide-search',
  templateUrl: './wide-search.component.html',
  styleUrls: ['./wide-search.component.scss'],
})
export class WideSearchComponent implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly assetsTypeMap = new Map<string, string>();

  searchForm = new FormGroup({
    searchField: new FormControl('', Validators.required)
  });

  isLoading = false;

  selected = SearchFilters.All;

  tabList = [
    SearchFilters.All,
    SearchFilters.Equities,
    SearchFilters.Option,
    SearchFilters.Future,
    SearchFilters.Bonds,
    SearchFilters.Currency,
    SearchFilters.Swaps
  ];

  securityList: SecurityMarketFlattened[];

  constructor(
    private readonly securityService: SecurityService,
    private readonly dialogRef: MatDialogRef<WideSearchComponent, { event: SecurityItem }>) {
    this.initializeAssetsTypeMap();
    this.initializeFormSubscription();
  }

  private initializeAssetsTypeMap(): void {
    this.assetsTypeMap.set(SearchFilters.All, '');
    this.assetsTypeMap.set(SearchFilters.Option, 'Option');
    this.assetsTypeMap.set(SearchFilters.Future, 'Future');
    this.assetsTypeMap.set(SearchFilters.Equities, 'Equity');
    this.assetsTypeMap.set(SearchFilters.Bonds, 'Bond');
    this.assetsTypeMap.set(SearchFilters.Swaps, 'trs');
    this.assetsTypeMap.set(SearchFilters.Currency, 'crncy');
  }

  private initializeFormSubscription(): void {
    this.searchForm.valueChanges.pipe(
      tap(() => this.isLoading = true),
      takeUntil(this.destroy$),
      debounceTime(550),
      mergeMap((v: { searchField: string }) =>
        v.searchField.length >= 2
          ? from(this.securityService.getSecuritiesByText(
            v.searchField, this.getAssetType(), this.getAdditionalFilters()))
          : of([] as SecurityMarketFlattened[]))
    ).subscribe(list => {
      this.securityList = list;
      this.isLoading = false;
    });
  }

  itemSelected(item: SearchFilters): void {
    this.selected = item;
    // trigger a new endpoint call to get data with new filter
    const control = this.getControl();
    control.setValue(control.value, { emitEvent: true });
  }

  searchFieldIsEmpty(): boolean {
    const control = this.getControl();
    return !control.value || control.value.trim().length === 0;
  }

  itemClicked(item: SecurityItem): void {
    this.dialogRef.close({ event: item });
  }

  closeModal(): void {
    this.dialogRef.close({ event: null });
  }

  private getAssetType(): string {
    const item = this.tabList.find(el => this.selected === el);
    return this.assetsTypeMap.get(item).toLowerCase();
  }

  private getAdditionalFilters(): { key: string; type: string; value: string[]; }[] {
    return [
      { 'key': 'feature', 'type': 'EQ', 'value': ['position-history'] }
    ];
  }

  private getControl(): AbstractControl {
    return this.searchForm.controls.searchField;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:keydown', ['$event'])
  onKeyPress($event: KeyboardEvent) {
    if ($event.code === 'Escape') {
      $event.preventDefault();
      $event.stopImmediatePropagation();
      this.closeModal();
    }
  }
}
