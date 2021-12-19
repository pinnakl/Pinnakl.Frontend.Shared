import { Component } from "@angular/core";
import { AgRendererComponent } from "ag-grid-angular";
import { ICellRendererParams } from "ag-grid-community";

@Component({
  selector: 'app-cell-icon',
  template: `
    <div [style]="styleParams">
      <span><i [classList]="icon"></i></span>
    </div>
    `
})
export class CellIconComponent implements AgRendererComponent {
  cellValue!: string;
  params;
  styleParams = {
    color: '#168eff',
    'text-align': 'center',
    width: '51px',
    'font-size': '14px'
  };
  icon;
  // gets called once before the renderer is used
  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.cellValue = this.getValueToDisplay(params);
    this.setStyleParamsUserCred(this.cellValue);
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

  setStyleParamsUserCred(cellValue: string) {
    const key = cellValue.toLowerCase();
    switch (key) {
      case 'qr':
        this.icon = 'icon-pinnakl-qr'
        this.styleParams = {
          ...this.styleParams,
          'font-size': '17px',
        };
        break;
      case 'email':
        this.icon = 'icon-pinnakl-email';
        this.styleParams = {
          ...this.styleParams,
          'font-size': '14px',
        };
        break;
      case 'mobile':
        this.icon = 'icon-pinnakl-mobile';
        this.styleParams = {
          ...this.styleParams,
          'font-size': '19px',
        };
        break;
      case '1':
        this.icon = 'icon-pinnakl-ok';
        this.styleParams = {
          ...this.styleParams,
          'font-size': '11px',
          color: '#00c94a',
          width: '25px',
        };
        break;
      case '0':
        this.icon = 'icon-pinnakl-close';
        this.styleParams = {
          ...this.styleParams,
          'font-size': '11px',
          color: '#f52b46',
          width: '25px',
        };
        break;
    }
  }

}
