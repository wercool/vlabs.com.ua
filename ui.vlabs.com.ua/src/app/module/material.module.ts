import { NgModule } from '@angular/core';

import {
    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatTabsModule,
    MatExpansionModule,
    MatTableModule,
    MatDialogModule,
    MatSidenavModule,
    MatChipsModule,
    MatSortModule,
    MatSelectModule,
    MatPaginatorModule,
    MatPaginatorIntl,
} from '@angular/material';

@NgModule({
  imports:
  [
    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatTabsModule,
    MatExpansionModule,
    MatTableModule,
    MatDialogModule,
    MatSidenavModule,
    MatChipsModule,
    MatSortModule,
    MatSelectModule,
    MatPaginatorModule,
  ],
  exports:
  [
    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatTabsModule,
    MatExpansionModule,
    MatTableModule,
    MatDialogModule,
    MatSidenavModule,
    MatChipsModule,
    MatSortModule,
    MatSelectModule,
    MatPaginatorModule,
  ],
  providers:
  [
    MatPaginatorIntl
  ],
  declarations: []
})
export class MaterialModule { }
