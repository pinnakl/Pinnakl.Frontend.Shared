import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PnklChartsModule } from '@pnkl-frontend/pnkl-charts';
import { PinnaklGridModule, SharedModule } from '@pnkl-frontend/shared';

const COMPONENTS = [];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    PinnaklGridModule,
    PnklChartsModule
  ],
  declarations: [...COMPONENTS],
  exports: [...COMPONENTS]
})
export class SharedComponentsModule {}
