import { Component } from '@angular/core';

import { AgRendererComponent } from 'ag-grid-angular';
import { Column, ICellRendererParams, RowNode } from 'ag-grid-community';

@Component({
  selector: 'pinnakl-grid-checkbox',
  templateUrl: './pinnakl-grid-checkbox.component.html'
})
export class PinnaklGridCheckboxComponent implements AgRendererComponent {
  checked = false;
  private _column?: Column;
  private _node?: RowNode;
  agInit({ column, node, value }: ICellRendererParams): void {
    this.checked = !!value;
    this._column = column;
    this._node = node;
  }
  getValue(): boolean {
    return this.checked;
  }
  onChange(checked: boolean): void {
    this.checked = checked;
    this._node.setDataValue(this._column, checked);
  }
  refresh(): boolean {
    return true;
  }
}
