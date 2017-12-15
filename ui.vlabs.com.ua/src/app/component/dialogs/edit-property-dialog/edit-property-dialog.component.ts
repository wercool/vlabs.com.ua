import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EditedProperty } from '../../../shared/models/edited-property';

@Component({
  selector: 'app-edit-property-dialog',
  templateUrl: './edit-property-dialog.component.html',
  styleUrls: ['./edit-property-dialog.component.css']
})
export class EditPropertyDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<EditPropertyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public editedProperty: EditedProperty,
  ) { }

  ngOnInit() {
    // console.log(this.editedProperty.context.object[this.editedProperty.context.property]);
  }

  complete() {
    this.dialogRef.close(this.editedProperty);
  }
}
