import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddButtonSelectComponent } from './add-button-select/add-button-select.component';
import { CommonContactModule } from '../common-contact/common-contact.module';
import { PinnaklModalModule } from '../../../../../pinnakl-modal/src';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [AddButtonSelectComponent],
  imports: [
    CommonModule,
    CommonContactModule,
    PinnaklModalModule,
    RouterModule
  ],
  exports: [
    AddButtonSelectComponent
  ]
})
export class CommonLayoutModule { }
