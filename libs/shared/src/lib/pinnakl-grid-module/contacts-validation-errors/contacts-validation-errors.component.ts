import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
@Component({
  selector: 'contacts-validation-errors',
  templateUrl: './contacts-validation-errors.component.html',
  styleUrls: ['./contacts-validation-errors.component.scss']
})
export class ContactsValidationErrorsComponent implements ICellRendererAngularComp {
  contactListErrors: { field: string; message: string }[];

  agInit(params: any): void {
    this.contactListErrors = params.value;
  }

  refresh(params: any): boolean {
    this.contactListErrors = params.value;
    return true;
  }
}
