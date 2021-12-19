import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'pnkl-menu-dropdown',
  templateUrl: './pnkl-menu-dropdown.component.html'
})
export class PnklMenuDropdownComponent {
  @Input() options: any;
  @Input() textField: string;
  @Input() menutext: string;
  @Input() highlight: boolean;
  @Input() routeField: string;
  @Output() optionSelected = new EventEmitter<void>();
  constructor(private readonly router: Router) {}

  optionSelectedEmit(option: any): void {
    this.router.navigate([option[this.routeField]], { queryParams: option['queryParams']});
    this.optionSelected.emit(option);
  }
}
