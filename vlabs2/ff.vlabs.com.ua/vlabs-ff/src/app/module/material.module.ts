import { NgModule } from '@angular/core';

import {
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
} from '@angular/material';

@NgModule({
  exports:
  [
    MatCardModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  providers:
  [
  ],
  declarations: []
})
export class MaterialModule { }
