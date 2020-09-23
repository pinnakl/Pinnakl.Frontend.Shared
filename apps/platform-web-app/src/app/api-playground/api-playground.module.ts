import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '@pnkl-frontend/shared';
import { ApiPlaygroundRoutingModule } from './api-playground-routing.module';
import { ApiPlaygroundHomeComponent } from './api-playground/api-playground-home.component';

@NgModule({
  declarations: [ApiPlaygroundHomeComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    ApiPlaygroundRoutingModule
  ],
  exports: [ApiPlaygroundHomeComponent],
  providers: []
})
export class ApiPlaygroundModule {}
