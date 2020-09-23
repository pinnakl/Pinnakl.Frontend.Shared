import { Injectable } from '@angular/core';
@Injectable()
export class PinnaklSpinner {
  visible = false;
  spin(): void {
    this.visible = true;
  }
  stop(): void {
    this.visible = false;
  }
}
