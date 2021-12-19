import { Component, Input, AfterViewInit } from '@angular/core';
import { RenderEvent } from '@progress/kendo-angular-charts';

@Component({
  selector: 'pinnakl-donut-chart',
  templateUrl: './pinnakl-donut-chart.component.html',
  styleUrls: ['./pinnakl-donut-chart.component.scss']
})
export class PinnaklDonutChartComponent implements AfterViewInit {
  colorArray: string[] = ['#d7d7d7'];
  @Input() color = '#00d565';
  @Input() percentCount: number;
  @Input() displayText: string;
  @Input() totalSubValue;
  ngAfterViewInit(): void {
    this.setChartColor();
    this.setPositionTextPercent();
  }

  setPositionTextPercent() {
    const nodesWithTextPercent = document.querySelectorAll('.circle-chart-amount');
    nodesWithTextPercent.forEach(element => {
      console.log(+element.innerHTML);

      if(+element.innerHTML === 100) {
        element.setAttribute("x", '15');
      } else {
        element.setAttribute("x", '17');
      }
    });
  }

  private setChartColor(): void {
    this.colorArray.unshift(this.color);
  }

  public onRender(e: RenderEvent): void {
  }
}
