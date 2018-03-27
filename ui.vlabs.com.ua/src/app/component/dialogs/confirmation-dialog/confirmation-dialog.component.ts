import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialog implements OnInit {

    constructor(
      public dialogRef: MatDialogRef<ConfirmationDialog>,
      @Inject(MAT_DIALOG_DATA) public confirmMessage: String,
    ) { }

    ngOnInit() {

    }
}