import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatSnackBar, MatDialog, MatTableDataSource, 
    MatDialogRef, MAT_DIALOG_DATA, 
    MatSort, MatPaginator, MatPaginatorIntl } from '@angular/material';
import { DisplayMessage } from '../../../../shared/models/display-message';

import { Collaborator, CollaboratorProject, CollaboratorProjectItem } from '../../../../model';
import { CollaboratorService } from '../../../../service';
import { AddCollaboratorProjectDialogComponent } from '../../collaborator-management/edit-collaborator/add-collaborator-project-dialog/add-collaborator-project-dialog.component';
import { ConfirmationDialog } from '../../../dialogs/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-edit-collaborator',
  templateUrl: './edit-collaborator.component.html',
  styleUrls: ['./edit-collaborator.component.css']
})
export class EditCollaboratorComponent implements OnInit {

    private sub: any;
    private collaborator: Collaborator;

    collaboratorProjectItems: CollaboratorProjectItem[] = [];

    generalCollaboratorFormGroup: FormGroup;

      /**
     * Notification message from received
     * form request or router
     */
    notification: DisplayMessage;

    submitted = false;
    completed = false;
    removeProject = false;


    collaboratorProjectsDisplayedColumns = ['id', 'name', 'alias'];
    collaboratorProjectsDS: MatTableDataSource<CollaboratorProjectItem> = new MatTableDataSource<CollaboratorProjectItem>([]);
 
    constructor(
      private route: ActivatedRoute,
      private router: Router,
      private snackBar: MatSnackBar,
      private formBuilder: FormBuilder,
      private collaboratorService: CollaboratorService,
      private addCollaboratorProjectDialog: MatDialog,
      private confirmationDialog: MatDialog
    ) { }
  
    ngOnInit() {
        this.completed = false;
        this.generalCollaboratorFormGroup = this.formBuilder.group({
            alias: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
        });

        this.sub = this.route.params.subscribe(params => {
            this.collaboratorService.getById(params['id'])
            .delay(250)
            .subscribe(collaborator => {
              this.setCollaborator(collaborator);
              this.completed = true;
              // console.log(this.collaborator);
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

    setCollaborator(collaborator: Collaborator) {
        this.collaborator = collaborator;
        this.collaboratorProjectItems = [];
        for (let collaboratorProject of this.collaborator.projects) {
          let collaboratorProjectItem: CollaboratorProjectItem = <CollaboratorProjectItem> collaboratorProject;
          collaboratorProjectItem.checked = false;
          this.collaboratorProjectItems.push(collaboratorProjectItem);
        }
        this.collaboratorProjectsDS = new MatTableDataSource<CollaboratorProjectItem>(this.collaboratorProjectItems);
        this.checkSelected();
    }

    onGeneralCollaboratorFormGroupSubmit() {
        this.submitted = true;

        this.collaboratorService.update(this.collaborator)
        // show the animation
        .delay(250)
        .subscribe(collaborator => {
            this.collaborator = collaborator;
            this.submitted = false;
            this.notification = { msgType: 'styles-success', msgBody: '<b>' + collaborator.alias + '</b>' + ' successfully updated' };
            setTimeout(() => { this.notification = undefined; }, 2000);
        },
        error => {
          this.submitted = false;
          if (this.snackBar["opened"]) return;
          this.snackBar.open(error.message, 'SERVER ERROR', {
            panelClass: ['errorSnackBar'],
            duration: 1000,
            verticalPosition: 'top'
          });
        });
    }
    
    openAddProjectDialog() {
      let dialogRef = this.addCollaboratorProjectDialog.open(AddCollaboratorProjectDialogComponent, {
        width: '80%',
        data: this.collaborator
      });
      dialogRef.afterClosed().subscribe(collaborator => {
        if (collaborator) {
          this.setCollaborator(collaborator);
        }
      });
    }

    removeSelectedProject() {
      let dialogRef = this.confirmationDialog.open(ConfirmationDialog, {
        width: '80%',
        data: "Confirm please Collaborator Project deletion"
      });
      dialogRef.afterClosed().subscribe(confirmed => {
        if (confirmed) {
          let removeCollaboratorProjects:CollaboratorProject[] = [];
          for (let collaboratorProjectItem of this.collaboratorProjectItems) {
            if (collaboratorProjectItem.checked) {
              let collaboratorProject:CollaboratorProject = new CollaboratorProject().map(collaboratorProjectItem);
              removeCollaboratorProjects.push(collaboratorProject);
            }
          }
          // console.log(this.groupMembersItems);
      
          this.submitted = true;
          this.collaboratorService.removeProjects(this.collaborator.id, removeCollaboratorProjects)
          .delay(250)
          .subscribe(collaborator => {
            this.setCollaborator(collaborator);
            this.submitted = false;
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
      });
    }

    checkSelected() {
        this.removeProject = false;
        for (let collaboratorProjectItem of this.collaboratorProjectItems) {
          if (collaboratorProjectItem.checked) {
            this.removeProject = true;
          }
        }
    }

}