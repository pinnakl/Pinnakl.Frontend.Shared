import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'pnl-action-button',
  templateUrl: './pnl-action-button.component.html'
})
export class PNLActionButtonComponent implements ICellRendererAngularComp {
  widget = false;
  params: any;
  refresh(): boolean {
    return true;
  }

  agInit(params: any): void {
    this.params = params;
  }

  discardSecId(): void {
    if (this.params.data) {
      this.params.context.componentParent.discardSecId([this.params]);
    } else if (this.params.node.allLeafChildren) {
      this.params.context.componentParent.discardSecId(
        this.params.node.allLeafChildren
      );
    }
  }

  enableSecId(): void {
    if (this.params.data) {
      this.params.context.componentParent.enableSecId([this.params]);
    } else if (this.params.node.allLeafChildren) {
      this.params.context.componentParent.enableSecId(
        this.params.node.allLeafChildren
      );
    }
  }

  toggleOff(): void {
    this.widget = false;
  }
}
