import { Component, Input, AfterViewInit } from '@angular/core';
import { RenderEvent } from '@progress/kendo-angular-charts';

@Component({
  selector: 'pinnakl-donut-chart',
  templateUrl: './pinnakl-donut-chart.component.html',
  styleUrls: ['./pinnakl-donut-chart.component.scss']
})
export class PinnaklDonutChartComponent implements AfterViewInit {
  constructor() {}
  colorArray: string[] = ['#d7d7d7'];
  @Input() color = '#00d565';
  @Input() transitions = false;
  @Input() fieldName: string;
  @Input() donutChartData: { [key: string]: number }[];
  @Input() percentCount: number;
  @Input() displayText: string;

  ngAfterViewInit(): void {
    this.setChartColor();
  }

  private setChartColor(): void {
    this.colorArray.unshift(this.color);
  }

  public onRender(e: RenderEvent): void {
  }
}
