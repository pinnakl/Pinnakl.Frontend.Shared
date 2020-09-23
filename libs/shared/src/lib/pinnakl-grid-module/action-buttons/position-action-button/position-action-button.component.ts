import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'position-action-button',
  templateUrl: './position-action-button.component.html'
})
export class PositionActionButtonComponent implements ICellRendererAngularComp {
  public params: any;
  public refresh(): boolean {
    return true;
  }

  agInit(params: any): void {
    this.params = params;
  }

  actionBtnClicked() {
    this.params.context.componentParent.actionBtnClicked(this.params.data);
  }
}
