import { Component, Input } from '@angular/core';

@Component({
  selector: 'position-vs-price',
  templateUrl: './position-vs-price.component.html'
})
export class PositionVsPriceComponent {
  @Input() securityId: number;
}
