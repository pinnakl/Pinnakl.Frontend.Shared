import { ICellRendererParams } from 'ag-grid-community';

export class CellRendererCirclePercent {
  private gui: HTMLElement;
  private lastValue: number;
  init({ value }: ICellRendererParams): void {
    this.gui = document.createElement('div');

    this.gui.innerHTML = this.buildHtmlChart(value);
    this.lastValue = value;
  }
  getGui(): HTMLElement {
    return this.gui;
  }
  refresh({ value }: ICellRendererParams): boolean {
    this.gui.innerHTML = this.buildHtmlChart(value);;

    if (this.lastValue === undefined) {
      this.lastValue = value;
      return true;
    }
    this.lastValue = value;
    return true;
  }

  buildHtmlChart(percent) {
    const color = percent === 100 ? '#168eff' : '#18d06b';
    return `<span class="cell-chart"> 
    <svg class="circle-chart" viewbox="0 0 33.83098862 33.83098862" width="14" height="15" xmlns="http://www.w3.org/2000/svg">
      <circle class="circle-chart__circle" stroke="${color}" stroke-width="5" stroke-dasharray="${percent - 5},100"  fill="none" cx="17" cy="17" r="14" />
    </svg>
    </span>
    <span> ${this.getWithoutDecimal(percent)}%</span>`;
  }

  getWithoutDecimal(percent) {
   return Math.round(percent);
  }
}
