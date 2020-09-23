import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'cf-action-button',
  templateUrl: './cf-action-button.component.html'
})
export class CfActionButtonComponent implements ICellRendererAngularComp {
  widget = false;
  params: any;
  refresh(): boolean {
    return true;
  }

  agInit(params: any): void {
    this.params = params;
  }

  deleteClicked(): void {
    this.params.context.componentParent.deleteCashFlow(this.params.data.id);
  }

  editClicked(): void {
    this.params.context.componentParent.editCashFlow(this.params.data);
  }

  toggleOff(): void {
    this.widget = false;
  }
}
