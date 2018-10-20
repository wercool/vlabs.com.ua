import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DisplayMessage } from '../../../shared/models/display-message';
import { MatTableDataSource, MatExpansionPanel, MatSnackBar, MatDialog } from '@angular/material';
import { CollaboratorService, UserService } from '../../../service';
import { Collaborator, CollaboratorProject, CollaboratorProjectWorkItem, User } from '../../../model';
import { ActivatedRoute, Router } from '@angular/router';
import { AddCollaboratorProjectWorkItemDialogComponent } from './add-project-work-item-dialog/add-project-work-item-dialog.component';

@Component({
  selector: 'app-collaborator-project-activity-management',
  templateUrl: './project-activity-management.component.html',
  styleUrls: ['./project-activity-management.component.css']
})
export class CollaboratorProjectActivityManagementComponent implements OnInit {

  private sub: any;

  private collaboratorProject: CollaboratorProject;
  private collaboratorProjectWorkItems: CollaboratorProjectWorkItem[];

  projectWorkItemsDisplayedColumns = ['id', 'title', 'alias', 'type'];
  projectWorkItemsDS: MatTableDataSource<CollaboratorProjectWorkItem>;

  completed: boolean = false;
  workItemsCompleted: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private collaboratorService: CollaboratorService,
    private userService: UserService,
    private addCollaboratorProjectWorkItemDialogComponent: MatDialog,
  ) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.collaboratorService.getProject(params['id'])
      .delay(250)
      .subscribe(collaboratorProject => {
        this.setProject(collaboratorProject);
        // console.log(this.collaboratorProject);
      },
      error => {
        if (this.snackBar["opened"]) return;
        this.snackBar.open(error.message, 'SERVER ERROR', {
          panelClass: ['errorSnackBar'],
          duration: 1000,
          verticalPosition: 'top'
        });
      });
    });
  }

  setProject(collaboratorProject: CollaboratorProject) {
    this.completed = true;
    this.workItemsCompleted = false;
    this.collaboratorProject = collaboratorProject;

    if (this.collaboratorService.currentCollaborator) {
      this.getProjectWorkItems(this.collaboratorService.currentCollaborator.id);
    } else {
      const user: User = this.userService.currentUser;
      this.collaboratorService.getByUserId(user.id)
      .delay(250)
      .subscribe(collaborator => {
        this.getProjectWorkItems(collaborator.id);
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
  }

  getProjectWorkItems(currentCollaboratorId: number) {
    this.collaboratorService.getProjectWorkItems(currentCollaboratorId, this.collaboratorProject.id)
    .delay(250)
    .subscribe(collaboratorProjectWorkItems => {
      this.setProjectWorkItems(collaboratorProjectWorkItems);
      // console.log(this.collaboratorProjectWorkItems);
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

  setProjectWorkItems(collaboratorProjectWorkItems: CollaboratorProjectWorkItem[]) {
    this.workItemsCompleted = true;
    this.collaboratorProjectWorkItems = collaboratorProjectWorkItems;
    this.refreshDS();
  }

  private refreshDS(){
    this.projectWorkItemsDS = new MatTableDataSource<CollaboratorProjectWorkItem>(this.collaboratorProjectWorkItems);
  }

  openAddProjectWorkItemDialog() {
    let dialogRef = this.addCollaboratorProjectWorkItemDialogComponent.open(AddCollaboratorProjectWorkItemDialogComponent, {
      width: '80%',
      data: { 
        collaboratorProject: this.collaboratorProject,
        collaboratorProjectWorkItems: this.collaboratorProjectWorkItems
      }
    });
    dialogRef.afterClosed().subscribe(collaboratorProject => {
      if (collaboratorProject) {
        this.setProject(collaboratorProject);
      }
    });
  }

  collaboratorProjectWorkItemRowClicked(collaboratorProjectWorkItem: CollaboratorProjectWorkItem) {
    this.router.navigate(['collaborator/work-item-activity', collaboratorProjectWorkItem.id]);
  }

}
