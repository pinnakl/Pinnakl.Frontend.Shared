import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@pnkl-frontend/shared';
import { ContactModalComponent } from './contact-modal/contact-modal.component';
import { InvestorContactEditorComponent } from './investor-contact-editor/investor-contact-editor.component';




@NgModule({
  declarations: [
    ContactModalComponent,
    InvestorContactEditorComponent
  ],
  exports: [
    ContactModalComponent,
    InvestorContactEditorComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class CommonContactModule { }
