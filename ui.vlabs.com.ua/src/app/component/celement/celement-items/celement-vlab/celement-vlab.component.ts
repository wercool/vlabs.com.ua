import { Component, OnInit, Input } from '@angular/core';
import { CElement, CElementItem } from '../../../../model/index';
import { CElementService } from '../../../../service/index';
import { MatSnackBar, MatDialog } from '@angular/material';

import { VLabItem } from "../../../../shared/models/celement/vlab-item";

import { AddVLabItemDialogComponent } from '../../../vlabs/add-vlab-item-dialog/add-vlab-item-dialog.component';

@Component({
  selector: 'celement-item-vlab',
  templateUrl: './celement-vlab.component.html',
  styleUrls: ['./celement-vlab.component.css']
})
export class CelementVLabComponent implements OnInit {

  @Input() cElement: CElement;

  cElementItemsCompleted = false;

  cElementItems: CElementItem[];

  vLabItem: VLabItem = new VLabItem();

  constructor(
    private snackBar: MatSnackBar,
    private cElementService: CElementService,
    private addVLabDialog: MatDialog,
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
      if (this.snackBar["opened"]) return;
      this.snackBar.open(error.message, 'SERVER ERROR', {
        panelClass: ['errorSnackBar'],
        duration: 1000,
        verticalPosition: 'top'
      });
    });
  }

  editNature() {
  //   let dialogRef = this.editPropertyDialog.open(EditPropertyDialogComponent, {
  //     width: '80%',
  //     data: { type: 'text-input', value: this.cElementItems[0].nature, caption: 'Label Content' }
  //   });
  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //       this.cElementItems[0].celementId = this.cElement.id;
  //       this.cElementItems[0].sid = 1;
  //       this.cElementItems[0].nature = result.value;

  //       this.cElementItemsCompleted = false;
  //       this.cElementService.updateCElementItem(this.cElementItems[0])
  //       .delay(250)
  //       .subscribe(cElementItem => {
  //         this.cElementItems[0] = cElementItem;
  //         this.cElementItemsCompleted = true;
  //       },
  //       error => {
  //         this.cElementItemsCompleted = false;
  //         if (this.snackBar["opened"]) return;
  //         this.snackBar.open(error.message, 'SERVER ERROR', {
  //           panelClass: ['errorSnackBar'],
  //           duration: 1000,
  //           verticalPosition: 'top'
  //         });
  //       });
  //     }
  //   });
  }

  addVLabItem() {
    let dialogRef = this.addVLabDialog.open(AddVLabItemDialogComponent, {
      width: '90%',
      height: '90%',
      data: this.vLabItem
    });
    dialogRef.afterClosed().subscribe(vlab => {
      if (vlab) {
        this.cElementItems[0].celementId = this.cElement.id;
        this.cElementItems[0].sid = 1;
        this.cElementItems[0].nature = vlab;

        console.log(vlab);

        // this.cElementItemsCompleted = false;
        // this.cElementService.updateCElementItem(this.cElementItems[0])
        // .delay(250)
        // .subscribe(cElementItem => {
        //   this.cElementItems[0] = cElementItem;
        //   this.cElementItemsCompleted = true;
        // },
        // error => {
        //   this.cElementItemsCompleted = false;
        //   if (this.snackBar["opened"]) return;
        //   this.snackBar.open(error.message, 'SERVER ERROR', {
        //     panelClass: ['errorSnackBar'],
        //     duration: 1000,
        //     verticalPosition: 'top'
        //   });
        // });
      }
    });
  }
}
