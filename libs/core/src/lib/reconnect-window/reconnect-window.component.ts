import { Component } from '@angular/core';
import { ReconnectWindow } from './reconnect-window.service';
@Component({
  selector: 'reconnect-window',
  templateUrl: 'reconnect-window.component.html'
})
export class ReconnectWindowComponent {
  constructor(public reconnectWindow: ReconnectWindow) {}
}
