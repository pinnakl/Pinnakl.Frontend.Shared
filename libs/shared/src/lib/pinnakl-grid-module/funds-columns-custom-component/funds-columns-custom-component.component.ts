import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'funds-columns-custom-component',
  templateUrl: './funds-columns-custom-component.component.html',
  styleUrls: ['./funds-columns-custom-component.component.scss']
})
export class FundsColumnsCustomComponentComponent
  implements OnInit, ICellRendererAngularComp {
  value;
  constructor(private router: Router) {}

  ngOnInit(): void {}

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
    this.router.navigate(['/crm/crm-home/investor-relations-dashboard']);
  }
}
