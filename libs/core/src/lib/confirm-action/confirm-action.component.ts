import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import { Subscription } from 'rxjs';

import { ConfirmActionService } from './confirm-action.service';

@Component({
  selector: 'confirm-action',
  templateUrl: './confirm-action.component.html',
  styleUrls: ['./confirm-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmActionComponent implements OnDestroy, OnInit {
  hideConfirmActionDialog = true;
  message: string;

  private _subscription: Subscription;
  private readonly DEFAULT_MESSAGE =
    'Are you sure you want to perform this action?';

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private confirmActionService: ConfirmActionService
  ) {}

  confirm(): void {
    this.confirmActionService.confirm();
    this.hideConfirmActionDialog = true;
    this.changeDetectorRef.detectChanges();
  }

  reject(): void {
    this.confirmActionService.reject();
    this.hideConfirmActionDialog = true;
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  ngOnInit(): void {
    this._subscription = this.confirmActionService.showCalled.subscribe(
      message => this.show(message)
    );
  }

  private show(message?: string): void {
    message = message || this.DEFAULT_MESSAGE;
    this.message = message;
    this.showModal();
    this.changeDetectorRef.detectChanges();
  }

  private showModal(): void {
    this.hideConfirmActionDialog = false;
  }
}
