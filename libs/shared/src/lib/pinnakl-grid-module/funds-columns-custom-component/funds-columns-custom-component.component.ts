import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'funds-columns-custom-component',
  templateUrl: './funds-columns-custom-component.component.html',
  styleUrls: ['./funds-columns-custom-component.component.scss']
})
export class FundsColumnsCustomComponentComponent
  implements ICellRendererAngularComp
{
  value;
  constructor(private readonly router: Router) {}

  agInit(params: any): void {
    this.value = params.value;
    // this.contactListErrors = params.value;
  }

  refresh(params: any): boolean {
    this.value = params.value;
    // this.contactListErrors = params.value;
    return true;
  }

  routeToInvestorDashboard(): void {
    this.router.navigate(['/crm/crm-home/fund-performance-stats']);
  }
}
