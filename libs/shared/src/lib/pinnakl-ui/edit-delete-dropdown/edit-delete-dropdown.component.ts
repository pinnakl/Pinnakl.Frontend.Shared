import { animate, style, transition, trigger } from '@angular/animations';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

@Component({
  selector: 'edit-delete-dropdown',
  templateUrl: './edit-delete-dropdown.component.html',
  styleUrls: ['./edit-delete-dropdown.component.scss'],
  animations: [
    trigger('visibleChanged', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate(300, style({ opacity: 1 }))
      ]),
      transition(':leave', [animate(300, style({ opacity: 0 }))])
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditDeleteDropdownComponent {
  @Input() show = false;
  @Input() actionsClass = '';
  @Output() delete = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  actionsVisible = false;
}
