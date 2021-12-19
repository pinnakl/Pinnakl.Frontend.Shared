import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'funds-column-content',
  templateUrl: './funds-column-content.component.html',
  styleUrls: ['./funds-column-content.component.scss']
})
export class FundsColumnContentComponent implements ICellRendererAngularComp {
  value: boolean;

  agInit(params: any): void {
    this.value = params.value;
    // this.contactListErrors = params.value;
  }

  refresh(params: any): boolean {
    this.value = params.value;
    // this.contactListErrors = params.value;
    return true;
  }
}
