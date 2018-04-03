import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar,
  MatTableDataSource } from '@angular/material';

import { Collaborator, CollaboratorProject, CollaboratorProjectItem } from '../../../../../model/index';
import { CollaboratorService } from '../../../../../service/index';

@Component({
  selector: 'add-collaborator-project-dialog',
  templateUrl: './add-collaborator-project-dialog.component.html',
  styleUrls: ['./add-collaborator-project-dialog.component.css']
})
export class AddCollaboratorProjectDialogComponent implements OnInit {

  completed = false;
  submitted = false;
  enabled = false;

  nonCollaboratorProjects: CollaboratorProject[] = [];
  nonCollaboratorProjectsItems: CollaboratorProjectItem[] = [];

  potentialCollaboratorProjectsDisplayedColumns = ['id', 'name', 'alias'];
  potentialCollaboratorProjectsDS: MatTableDataSource<CollaboratorProjectItem> = new MatTableDataSource<CollaboratorProjectItem>([]);

  constructor(
    public dialogRef: MatDialogRef<AddCollaboratorProjectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public collaborator: Collaborator,
    private collaboratorService: CollaboratorService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    console.log("Selected Collaborator:", this.collaborator);

    this.collaboratorService.getNonCollaboratorProjects(this.collaborator.id)
    .delay(250)
    .subscribe(nonCollaboratorProjects => {
      this.nonCollaboratorProjects = nonCollaboratorProjects;
      this.completed = true;
      // console.log(this.nonCollaboratorProjects);
      for (let nonCollaboratorProject of this.nonCollaboratorProjects) {
        let nonCollaboratorProjectItem: CollaboratorProjectItem = <CollaboratorProjectItem> nonCollaboratorProject;
        nonCollaboratorProjectItem.checked = false;
        this.nonCollaboratorProjectsItems.push(nonCollaboratorProjectItem);
      }
      this.potentialCollaboratorProjectsDS = new MatTableDataSource<CollaboratorProjectItem>(this.nonCollaboratorProjectsItems);
    },
    error => {
      this.snackBar.open(error.message, 'SERVER ERROR', {
        panelClass: ['errorSnackBar'],
        duration: 1000,
        verticalPosition: 'top'
      });
    });
  }

  checkSelected() {
    this.enabled = false;
    for (let nonCollaboratorProjectsItem of this.nonCollaboratorProjectsItems) {
      if (nonCollaboratorProjectsItem.checked) {
        this.enabled = true;
      }
    }
  }

  addCollaboratorProjects() {
    let newCollaboratorProjects:CollaboratorProject[] = [];
    for (let nonCollaboratorProjectsItem of this.nonCollaboratorProjectsItems) {
      if (nonCollaboratorProjectsItem.checked) {
        let nonCollaboratorProjects:CollaboratorProject = new CollaboratorProject().map(nonCollaboratorProjectsItem);
        newCollaboratorProjects.push(nonCollaboratorProjects);
      }
    }
    // console.log(newCollaboratorProjects);

    this.submitted = true;
    this.collaboratorService.addProjects(this.collaborator.id, newCollaboratorProjects)
    .delay(250)
    .subscribe(collaborator => {
      this.dialogRef.close(collaborator);
    },
    error => {
      this.snackBar.open(error.message, 'SERVER ERROR', {
        panelClass: ['errorSnackBar'],
        duration: 1000,
        verticalPosition: 'top'
      });
    });
  }

}
