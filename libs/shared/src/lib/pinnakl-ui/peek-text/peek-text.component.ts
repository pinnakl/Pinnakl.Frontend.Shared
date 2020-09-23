import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'peek-text',
  templateUrl: 'peek-text.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PeekTextComponent {
  @Input() peekLength = 100;
  @Input() text = '';
  @Input() textClass = '';

  showAllText = false;

  sliceText(): string {
    return this.text.slice(0, this.peekLength);
  }
}
