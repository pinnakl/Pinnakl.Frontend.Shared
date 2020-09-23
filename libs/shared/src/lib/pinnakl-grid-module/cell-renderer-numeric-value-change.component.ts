import { ICellRendererParams } from 'ag-grid-community';

export class CellRendererNumericValueChange {
  private gui: HTMLElement;
  private lastValue: number;
  init({ value, valueFormatted }: ICellRendererParams): void {
    this.gui = document.createElement('div');
    this.gui.innerText = valueFormatted;
    this.lastValue = value;
  }
  getGui(): HTMLElement {
    return this.gui;
  }
  refresh({ value, valueFormatted }: ICellRendererParams): boolean {
    this.gui.innerText = valueFormatted;
    if (this.lastValue === undefined) {
      this.lastValue = value;
      return true;
    }
    if (value > this.lastValue) {
      this.gui.style.color = 'green';
    }
    if (value < this.lastValue) {
      this.gui.style.color = 'red';
    }
    this.lastValue = value;
    return true;
  }
}
