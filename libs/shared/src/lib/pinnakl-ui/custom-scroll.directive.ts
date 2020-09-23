import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Renderer2
} from '@angular/core';

import { debounce } from 'lodash';
import * as optiscroll from 'optiscroll';

@Directive({
  selector: '[pnklCustomScroll]'
})
export class CustomScrollDirective implements OnInit {
  private lightScrollBarClass = 'custom-scroll-light';
  private optiScrollClass = 'optiscroll';
  @Input() darkMode = false;
  @Input() disableInfiniteScroll = false;
  @Output() whenScrolledTo = new EventEmitter<void>();
  private debouncedOnScroll = debounce(
    () => {
      if (!this.disableInfiniteScroll) {
        this.whenScrolledTo.emit();
      }
    },
    100,
    {}
  );

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {
    this.renderer.addClass(this.elementRef.nativeElement, this.optiScrollClass);
  }

  ngOnInit(): void {
    if (this.darkMode) {
      this.renderer.addClass(
        this.elementRef.nativeElement,
        this.lightScrollBarClass
      );
    }

    const referenceDirective = this;
    let element = this.elementRef.nativeElement;
    let myOptiscrollInstance = optiscroll(element, {});
    element.addEventListener('scrollreachbottom', function(ev) {
      referenceDirective.debouncedOnScroll();
    });
  }
}
