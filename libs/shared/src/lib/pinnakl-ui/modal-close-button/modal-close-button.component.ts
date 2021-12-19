import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'pnkl-modal-close-btn',
  templateUrl: './modal-close-button.component.html',
  styleUrls: ['./modal-close-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalCloseButtonComponent { }
