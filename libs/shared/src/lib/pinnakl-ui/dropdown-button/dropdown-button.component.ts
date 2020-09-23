import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'dropdown-button',
  templateUrl: './dropdown-button.component.html',
  styleUrls: ['./dropdown-button.component.scss']
})
export class DropdownButtonComponent {
  @Input() highlight: boolean;
  @Input() options: Array<any>;
  @Input() textField: string;
  @Output() optionSelected = new EventEmitter<void>();
  @Input() menutext: string;
  selectedItem: any;
  constructor() {}

  onFocus(): void {}

  onBlur(): void {}

  onClose(): void {}

  onOpen(): void {}

  onItemClick(option: any): void {
    this.selectedItem = option;
    this.optionSelected.emit(option);
  }
}
