import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'pnkl-menu-dropdown',
  templateUrl: './pnkl-menu-dropdown.component.html'
})
export class PnklMenuDropdownComponent implements OnInit {
  @Input() options: any;
  @Input() textField: string;
  @Input() menutext: string;
  @Input() highlight: boolean;
  @Input() routeField: string;
  @Output() optionSelected = new EventEmitter<void>();
  constructor(private router: Router) {}

  ngOnInit(): void {}

  optionSelectedEmit(option: any): void {
    this.router.navigate([option[this.routeField]]);
    this.optionSelected.emit(option);
  }
}
