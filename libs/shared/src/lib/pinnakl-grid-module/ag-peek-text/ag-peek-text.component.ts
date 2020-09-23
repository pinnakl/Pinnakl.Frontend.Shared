import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input
} from '@angular/core';

@Component({
  selector: 'ag-peek-text',
  templateUrl: 'ag-peek-text.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgPeekTextComponent {
  @Input() peekLength = 160;
  @Input() text = '';
  @Input() textClass = '';
  private params: any;
  showAllText = false;
  intialHeight = 0;

  agInit(params: any): void {
    this.params = params;
    if (!this.params.value) {
      return;
    }
    this.text = `${this.params.value.trim()}\n`;
  }

  constructor(private em: ElementRef) {}

  private getRowHeight(): number {
    const element = (<HTMLElement>this.em.nativeElement)
      .firstChild as HTMLElement;
    if (this.params.value) {
      return element.offsetHeight + 25;
    }
    return 25;
  }

  sliceText(): string {
    return this.text.slice(0, this.peekLength);
  }

  onHideClicked(): void {
    this.showAllText = false;
    setTimeout(() => {
      this.params.node.setRowHeight(this.getRowHeight());
      this.params.api.onRowHeightChanged();
    });
  }

  onMoreClicked(): void {
    this.showAllText = true;
    setTimeout(() => {
      this.params.node.setRowHeight(this.getRowHeight());
      this.params.api.onRowHeightChanged();
    });
  }
}
