import { Component, OnInit, Input } from '@angular/core';
import { CElement, CElementItem } from '../../../../model/index';
import { CElementService } from '../../../../service/index';
import { MatSnackBar, MatDialog } from '@angular/material';

import { EditPropertyDialogComponent } from "../../../dialogs/edit-property-dialog/edit-property-dialog.component";

@Component({
  selector: 'celement-item-label',
  templateUrl: './celement-label.component.html',
  styleUrls: ['./celement-label.component.css']
})
export class CelementLabelComponent implements OnInit{

  @Input() cElement: CElement;

  cElementItemsCompleted = false;

  cElementItems: CElementItem[];

  constructor(
    private snackBar: MatSnackBar,
    private cElementService: CElementService,
    private editPropertyDialog: MatDialog,
  ) { }

  ngOnInit() {
    this.cElementService.getCElementItemsByCElementId(this.cElement.id)
    .delay(250)
    .subscribe(cElementItems => {
      this.cElementItems = cElementItems;
      if (this.cElementItems.length == 0) {
        let cElementItem: CElementItem = new CElementItem();
        this.cElementItems.push(cElementItem);
      }
      this.cElementItemsCompleted = true;
    },
    error => {
      this.snackBar.open(error.json().message, 'SERVER ERROR', {
        panelClass: ['errorSnackBar'],
        duration: 1000,
        verticalPosition: 'top'
      });
    });
  }

  editNature() {
    let dialogRef = this.editPropertyDialog.open(EditPropertyDialogComponent, {
      width: '80%',
      data: { type: 'text-input', value: this.cElementItems[0].nature, caption: 'Label Content' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cElementItems[0].celementId = this.cElement.id;
        this.cElementItems[0].sid = 1;
        this.cElementItems[0].nature = result.value;

        this.cElementItemsCompleted = false;
        this.cElementService.updateCElementItem(this.cElementItems[0])
        .delay(250)
        .subscribe(cElementItem => {
          this.cElementItems[0] = cElementItem;
          this.cElementItemsCompleted = true;
        },
        error => {
          this.cElementItemsCompleted = false;
          this.snackBar.open(error.json().message, 'SERVER ERROR', {
            panelClass: ['errorSnackBar'],
            duration: 1000,
            verticalPosition: 'top'
          });
        });
      }
    });
  }
}
