import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'help-home',
  templateUrl: './help-home.component.html',
  styleUrls: ['./help-home.component.scss']
})
export class HelpHomeComponent {
  showCrmOptions = false;
  modules = [
    {
      id: 1,
      name: 'Dashboard',
      iconClass: 'icon-pinnakl-side-dashboard'
    },
    {
      id: 2,
      name: 'Positions',
      iconClass: 'icon-pinnakl-side-positions-active'
    },
    {
      id: 3,
      name: 'OMS',
      iconClass: 'icon-pinnakl-side-oms'
    },
    {
      id: 4,
      name: 'Pricing',
      iconClass: 'icon-pinnakl-side-pricing-active'
    },
    {
      id: 5,
      name: 'Reconciliation',
      iconClass: 'icon-pinnakl-side-reconciliation-active-svg'
    },
    {
      id: 6,
      name: 'Reports',
      iconClass: 'icon-pinnakl-side-reports-active'
    },
    {
      id: 7,
      name: 'Securities',
      iconClass: 'icon-pinnakl-side-securities-active'
    },
    {
      id: 8,
      name: 'Corporate Actions',
      iconClass: 'custom-icon-corporate-action'
    }
  ];

  constructor(public router: Router) {}

  openDocumentation(name: string): void {
    this.router.navigate(['help', name]);
  }

  toggleCRMOptions(): void {
    this.showCrmOptions = !this.showCrmOptions;
  }
}
