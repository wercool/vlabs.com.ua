import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar, MatTableDataSource, MatSort } from '@angular/material';
import { CollaboratorService } from '../../../../service';
import { CollaboratorProjectWorkItem } from '../../../../model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-collaborator-work-items-table',
  templateUrl: './collaborator-work-items-table.component.html',
  styleUrls: ['./collaborator-work-items-table.component.css']
})
export class CollabortatorWorkItemsTableComponent implements OnInit {

  workItems: CollaboratorProjectWorkItem[];

  workItemsCompleted = false;

  projectWorkItemsDisplayedColumns = ['id', 'collaboratorAlias', 'title', 'alias', 'type'];
  projectWorkItemsDS: MatTableDataSource<CollaboratorProjectWorkItem>;

  @ViewChild(MatSort) sortWorkItemsDS: MatSort;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private collaboratorService: CollaboratorService
  ) { }

  ngOnInit() {
    this.workItemsCompleted = false;
    this.collaboratorService.getAllWorkItems()
    .delay(250)
    .subscribe(workItems => {
      this.setWorkItems(workItems);
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

  setWorkItems(workItems: CollaboratorProjectWorkItem[]) {
    this.workItems = workItems;
    // console.log(this.workItems);
    this.workItemsCompleted = true;
    this.refreshDS();
  }

  private refreshDS(){
    this.projectWorkItemsDS = new MatTableDataSource<CollaboratorProjectWorkItem>(this.workItems);
    this.projectWorkItemsDS.sort = this.sortWorkItemsDS;
  }

  workItemRowClicked(workItem: CollaboratorProjectWorkItem) {
    this.router.navigate(['collaborator/work-item-activity', workItem.id]);
  }
}
