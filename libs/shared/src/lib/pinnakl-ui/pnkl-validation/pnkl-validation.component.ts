import { Component, Input } from '@angular/core';

@Component({
  selector: 'pnkl-validation',
  templateUrl: 'pnkl-validation.component.html',
  styleUrls: ['pnkl-validation.component.scss']
})
export class PnklValidationComponent {
  @Input() form;
  @Input() controlName;
}
