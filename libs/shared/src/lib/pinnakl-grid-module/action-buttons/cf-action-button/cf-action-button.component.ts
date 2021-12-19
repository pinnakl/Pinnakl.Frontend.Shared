import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { RotateAnimationStateStatus, rotatedState } from '../../../animations/rotation';

@Component({
  selector: 'cf-action-button',
  templateUrl: './cf-action-button.component.html',
  styleUrls: ['./cf-action-button.component.scss'],
  animations: [rotatedState()]
})
export class CfActionButtonComponent implements ICellRendererAngularComp {
  widget = false;
  params: any;
  state: RotateAnimationStateStatus = RotateAnimationStateStatus.Default;
  refresh(): boolean {
    return true;
  }

  agInit(params: any): void {
    this.params = params;
  }

  deleteClicked(): void {
    this.params.context.componentParent.deleteCashFlow(this.params.data.id);
  }

  editClicked(): void {
    this.params.context.componentParent.editCashFlow(this.params.data);
  }

  dotsHandler(): void {
    this.widget = !this.widget;
    this.state = this.state === RotateAnimationStateStatus.Default
      ? RotateAnimationStateStatus.Rotated : RotateAnimationStateStatus.Default;
  }

  toggleOff(): void {
    this.widget = false;
  }
}
