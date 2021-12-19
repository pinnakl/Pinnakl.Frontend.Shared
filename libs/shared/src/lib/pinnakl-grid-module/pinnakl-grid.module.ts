import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import { SharedModule } from '../shared.module';

import { GridActionButtonComponent } from './action-buttons';
import { CfActionButtonComponent } from './action-buttons/cf-action-button/cf-action-button.component';
import { PNLActionButtonComponent } from './action-buttons/pnl-action-button/pnl-action-button.component';
import { PositionActionButtonComponent } from './action-buttons/position-action-button/position-action-button.component';
import { AgPeekTextComponent } from './ag-peek-text/ag-peek-text.component';
import { ContactsValidationErrorsComponent } from './contacts-validation-errors/contacts-validation-errors.component';
import { FundsColumnContentComponent } from './funds-column-content/funds-column-content.component';
import { FundsColumnsCustomComponentComponent } from './funds-columns-custom-component/funds-columns-custom-component.component';
import { PinnaklGridCheckboxComponent } from './pinnakl-grid-checkbox';
import { PinnaklGridComponent } from './pinnakl-grid/pinnakl-grid.component';

@NgModule({
  imports: [
    AgGridModule.withComponents([
      AgPeekTextComponent,
      CfActionButtonComponent,
      ContactsValidationErrorsComponent,
      FundsColumnsCustomComponentComponent,
      FundsColumnContentComponent,
      GridActionButtonComponent,
      PinnaklGridCheckboxComponent,
      PNLActionButtonComponent,
      PositionActionButtonComponent
    ]),
    CommonModule,
    SharedModule
  ],
  declarations: [
    AgPeekTextComponent,
    CfActionButtonComponent,
    ContactsValidationErrorsComponent,
    FundsColumnsCustomComponentComponent,
    FundsColumnContentComponent,
    GridActionButtonComponent,
    PinnaklGridCheckboxComponent,
    PinnaklGridComponent,
    PNLActionButtonComponent,
    PositionActionButtonComponent,
  ],
  exports: [
    AgGridModule,
    CfActionButtonComponent,
    ContactsValidationErrorsComponent,
    FundsColumnsCustomComponentComponent,
    FundsColumnContentComponent,
    GridActionButtonComponent,
    PinnaklGridComponent,
    PNLActionButtonComponent,
    PositionActionButtonComponent,
  ]
})
export class PinnaklGridModule {}
