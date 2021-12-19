import { Component, EventEmitter, Input, Output } from '@angular/core';

import { SessionInformation } from '@pnkl-frontend/core';

@Component({
  selector: 'session-manager',
  templateUrl: './session-manager.component.html',
  styleUrls: ['./session-manager.component.scss']
})
export class SessionManagerComponent {
  @Input() sessions: SessionInformation[] = [];
  @Input() visible = false;
  @Output() deactivateAllSessions = new EventEmitter<void>();
  @Output() deactivateSession = new EventEmitter<SessionInformation>();
  @Output() onClose = new EventEmitter<void>();
}
