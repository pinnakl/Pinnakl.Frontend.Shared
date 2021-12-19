import { Component } from "@angular/core";
import { AgRendererComponent } from "ag-grid-angular";
import { ICellRendererParams } from "ag-grid-community";

@Component({
  selector: 'app-cell-status',
  template: `
    <div [style]="styleParams">
      <span>{{cellValue}}</span>
    </div>
    `
})
export class CellStatusComponent implements AgRendererComponent {
  cellValue!: string;
  params;
  styleParams = {
    border: '1px solid #f52b46',
    color: '#f52b46',
    'border-radius': '100px',
    padding: '0px 8px',
    'font-size': '14px',
  };
  // gets called once before the renderer is used
  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.cellValue = this.getValueToDisplay(params);
    this.getParamsToDisplay();
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

  getParamsToDisplay() {
    switch (this.params.statusType) {
      case 'user-credentials':
        this.setStyleParamsUserCred(this.cellValue);
        break;
      case 'accounting-data-upload': {
        this.setStyleParamsDataUpload(this.cellValue);
        break;
      }
    }
  }

  setStyleParamsUserCred(cellValue) {
    switch (cellValue) {
      case 'New User':
        this.styleParams = null;
        break;
      case 'Deactivated':
        this.styleParams = {
          ...this.styleParams,
          border: '1px solid #f52b46',
          color: '#f52b46',
        };
        break;
      case 'Enabled':
        if (this.params.data.accessdate) {
          this.styleParams = {
            ...this.styleParams,
            border: '1px solid #00c94a',
            color: '#00c94a',
          };
          this.cellValue = `${cellValue}. Last access: ${new Date(this.params.data.accessdate).toLocaleDateString()}`;
        } else {
          this.styleParams = {
            ...this.styleParams,
            border: '1px solid #f52b46',
            color: '#f52b46',
          };
          this.cellValue = 'Deactivated';
        }
        
        break;
    }
  }

  setStyleParamsDataUpload(cellValue) {
    switch (cellValue) {
      case 'False':
      case '0':
        this.styleParams = null;
        this.cellValue = 'Incomplete'
        break;
      case 'True':
      case '1':
        this.styleParams = {
          ...this.styleParams,
          border: '1px solid #00c94a',
          color: '#00c94a',
        };
        this.cellValue = 'Complete'
        break;
    }
  }

}
