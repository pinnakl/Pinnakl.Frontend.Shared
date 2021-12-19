import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { ToggleFilter } from '../shared/pnl-ui-state/store/pnl-filters';

@Component({
  selector: 'pnl-home',
  templateUrl: './pnl-home.component.html',
  styleUrls: ['./pnl-home.component.scss']
})
export class PnlHomeComponent implements OnInit, OnDestroy {
  tabSelected: string;
  routeUrlSubscription: Subscription;

  pnlComponents = [
    {
      componentName: 'Dashboard',
      componentRoute: 'pnl-dashboard'
    },
    {
      componentName: 'P&L - Table',
      componentRoute: 'pnl-table'
    },
    {
      componentName: 'P&L - Heatmap',
      componentRoute: 'pnl-heatmap'
    }
    // {
    //   componentName: 'Yearly P&L',
    //   componentRoute: 'pnl-yearly'
    // }
  ];
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly store: Store<any>
  ) {}

  ngOnDestroy(): void {
    this.routeUrlSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.routeUrlSubscription = this.activatedRoute.url.subscribe(() => {
      this.setSelectedTab();
    });
  }

  selectTab(selectedTab: string): void {
    this.tabSelected = selectedTab;
  }

  setSelectedTab(): void {
    let tempArray = this.activatedRoute.snapshot.firstChild
      .toString()
      .split('path');
    let urlPath = tempArray[1];
    tempArray = urlPath.split('\'');
    urlPath = tempArray[1];
    this.tabSelected = urlPath;
  }

  toggleFilter(): void {
    this.store.dispatch(ToggleFilter());
  }
}
