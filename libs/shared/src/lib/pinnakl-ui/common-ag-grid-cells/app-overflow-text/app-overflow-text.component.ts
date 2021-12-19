import { Component } from "@angular/core";
import { AgRendererComponent } from "ag-grid-angular";
import { ICellRendererParams } from "ag-grid-community";

@Component({
  selector: 'app-overflow-text',
  template: `
    <div class="overflow-clip" [style]="styles">
      {{cellValue}}
    </div>
    `
})
export class OverflowTextComponent implements AgRendererComponent {
  cellValue!: string;
  styles = {};
  // gets called once before the renderer is used
  agInit(params: ICellRendererParams): void {
    this.styles = params['styles'];
    this.cellValue = this.getValueToDisplay(params);
  }

  // gets called whenever the user gets the cell to refresh
  refresh(params: ICellRendererParams) {
    // set value into cell again
    this.cellValue = this.getValueToDisplay(params);
    return true;
  }

  getValueToDisplay(params: ICellRendererParams) {
    return params.valueFormatted ? params.valueFormatted : params.value;
  }
}
