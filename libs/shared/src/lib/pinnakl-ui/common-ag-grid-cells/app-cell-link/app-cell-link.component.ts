import { Component } from "@angular/core";
import { AgRendererComponent } from "ag-grid-angular";
import { ICellRendererParams } from "ag-grid-community";

@Component({
  selector: 'app-cell-link',
  templateUrl: 'app-cell-link.component.html'
})
export class CellLinkComponent implements AgRendererComponent {
  linkValue!: string;

  // gets called once before the renderer is used
  agInit(params: ICellRendererParams): void {
    this.linkValue = this.getValueToDisplay(params);
  }

  // gets called whenever the user gets the cell to refresh
  refresh(params: ICellRendererParams) {
    // set value into cell again
    this.linkValue = this.getValueToDisplay(params);
    return true;
  }

  getValueToDisplay(params: ICellRendererParams) {
    return params.valueFormatted ? params.valueFormatted : params.value;
  }
}
