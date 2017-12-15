import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { VLabItem } from '../../../shared/models/celement/vlab-item';

@Component({
  selector: 'add-vlab-item-dialog',
  templateUrl: './add-vlab-item-dialog.component.html',
  styleUrls: ['./add-vlab-item-dialog.component.css']
})
export class AddVLabItemDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<AddVLabItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public vLabItem: VLabItem,
  ) { }

  ngOnInit() {

  }

  complete() {
    this.vLabItem.comments = ".....";
    this.vLabItem.vlabId = 100;

    this.dialogRef.close(this.vLabItem);
  }
}
