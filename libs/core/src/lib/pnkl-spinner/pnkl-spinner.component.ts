import { Component } from '@angular/core';
import { PinnaklSpinner } from './pnkl-spinner.service';
@Component({
  selector: 'pnkl-spinner',
  templateUrl: 'pnkl-spinner.component.html',
  styleUrls: ['pnkl-spinner.component.scss']
})
export class PinnaklSpinnerComponent {
  constructor(public spinner: PinnaklSpinner) {}
}
