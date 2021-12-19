import { ICellRendererParams } from 'ag-grid-community';

export class CellRendererTranTypeTag {
  private gui: HTMLElement;
  private lastValue: number;
  init({ value }: ICellRendererParams): void {
    this.gui = document.createElement('div');
    this.gui.classList.add('ems-trantype-tag');
    this.addColors(value);

    this.gui.innerHTML = `<span>${value}</span>`;
    this.lastValue = value;
  }
  getGui(): HTMLElement {
    return this.gui;
  }
  refresh({ value }: ICellRendererParams): boolean {
    this.gui.classList.add('ems-trantype-tag');
    this.addColors(value);

    this.gui.innerHTML = `<span>${value}</span>`;

    if (this.lastValue === undefined) {
      this.lastValue = value;
      return true;
    }
    this.lastValue = value;
    return true;
  }

  addColors(value: any): void {
    if (value.toLowerCase() === 'sell') {
      this.gui.classList.add('red');
    } else if (value.toLowerCase() === 'short') {
      this.gui.classList.add('orange');
    } else if (value.toLowerCase() === 'cover') {
      this.gui.classList.add('blue');
    }
  }
}
