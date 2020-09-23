import { ICellRendererParams } from 'ag-grid-community';

export class CellRendererPositiveNegative {
  private gui: HTMLElement;
  init({ value, valueFormatted }: ICellRendererParams): void {
    this.gui = document.createElement('div');
    this.renderCell(value, valueFormatted);
  }
  getGui(): HTMLElement {
    return this.gui;
  }
  refresh({ value, valueFormatted }: ICellRendererParams): boolean {
    this.renderCell(value, valueFormatted);
    return true;
  }
  private renderCell(value: number, valueFormatted: string): void {
    this.gui.innerText = valueFormatted;
    if (value < 0) {
      this.gui.style.color = 'red';
    } else {
      this.gui.style.color = 'green';
    }
  }
}
