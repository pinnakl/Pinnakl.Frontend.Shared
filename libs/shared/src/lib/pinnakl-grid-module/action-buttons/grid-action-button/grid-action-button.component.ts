import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import {
  IAfterGuiAttachedParams,
  ICellRendererParams
} from 'ag-grid-community';

@Component({
  selector: 'grid-action-button',
  templateUrl: './grid-action-button.component.html',
  styleUrls: ['./grid-action-button.component.scss']
})
export class GridActionButtonComponent implements ICellRendererAngularComp {
  params: ICellRendererParams;
  showOptions = false;
  showConfirmDialog = false;

  refresh(): boolean {
    return false;
  }
  agInit(params: ICellRendererParams): void {
    this.params = params;
  }
  afterGuiAttached?(params: IAfterGuiAttachedParams): void { }

  cloneClicked(): void {
    this.params.context.clone(this.params.data);
    this.showOptions = false;
  }

  deleteClicked(): void {
    this.showConfirmDialog = !this.showConfirmDialog;
  }

  editClicked(): void {
    this.params.context.edit(this.params.data);
    this.showOptions = false;
  }

  allocateClicked(): void {
    this.params.context.allocate(this.params.data);
    this.showOptions = false;
  }

  historyClicked(): void {
    this.params.context.showHistory(this.params.data);
    this.showOptions = false;
  }

  toggleOptions(): void {
    this.showOptions = !this.showOptions;
  }

  //#region confirm handle
  onDeleteCancelledClicked() {
    this.showConfirmDialog = !this.showConfirmDialog;
  }

  onDeleteConfirmedClicked() {
    this.params.context.delete(this.params.data);
    this.showOptions = false;
  }
  //#endregion
}
