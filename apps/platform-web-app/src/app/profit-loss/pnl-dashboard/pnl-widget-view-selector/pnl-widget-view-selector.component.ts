import { Component, forwardRef } from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'pnl-widget-view-selector',
  templateUrl: './pnl-widget-view-selector.component.html',
  styleUrls: ['./pnl-widget-view-selector.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PnlWidgetViewSelectorComponent),
      multi: true
    }
  ]
})
export class PnlWidgetViewSelectorComponent implements ControlValueAccessor {
  selectedView = 'pie';
  onChange: (value: string) => void;
  writeValue(value: string): void {
    this.selectedView = value;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {}
  selectView(value: string): void {
    this.selectedView = value;
    this.onChange(value);
  }
}
