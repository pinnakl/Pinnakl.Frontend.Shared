import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { SessionInformation } from '../session-information.model';

@Component({
  selector: 'session-manager',
  templateUrl: './session-manager.component.html',
  styleUrls: ['./session-manager.component.scss']
})
export class SessionManagerComponent implements OnInit {
  @Input() sessions: SessionInformation[] = [];
  @Input() visible = false;
  @Output() deactivateAllSessions = new EventEmitter<void>();
  @Output() deactivateSession = new EventEmitter<SessionInformation>();
  @Output() onClose = new EventEmitter<void>();
  constructor() {}

  ngOnInit(): void {}
}
