import { Injectable } from '@angular/core';
@Injectable()
export class ReconnectWindow {
  visible = false;
  hide(): void {
    this.visible = false;
  }
  show(): void {
    this.visible = true;
  }
}
