import { NgModule } from '@angular/core';

import {
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
} from '@angular/material';

@NgModule({
  exports:
  [
    MatCardModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
  ],
  providers:
  [
  ],
  declarations: []
})
export class MaterialModule { }
