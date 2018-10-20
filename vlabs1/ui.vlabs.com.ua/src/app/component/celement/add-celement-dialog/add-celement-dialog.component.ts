import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-add-celement-dialog',
  templateUrl: './add-celement-dialog.component.html',
  styleUrls: ['./add-celement-dialog.component.css']
})
export class AddCelementDialogComponent implements OnInit {

  selectedCElementType: string;

  constructor(
    public dialogRef: MatDialogRef<AddCelementDialogComponent>,
  ) { }

  ngOnInit() {
  }

  addCElement() {
    if (this.selectedCElementType) {
      this.dialogRef.close({type: this.selectedCElementType});
    } else {
      this.dialogRef.close();
    }
  }
}
