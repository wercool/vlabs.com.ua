import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar,
  MatTableDataSource, MatFormFieldControl } from '@angular/material';

import { CollaboratorProject, CollaboratorProjectWorkItem } from '../../../../model/index';
import { CollaboratorService } from '../../../../service/index';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'add-collaborator-project-work-item-dialog',
  templateUrl: './add-project-work-item-dialog.component.html',
  styleUrls: ['./add-project-work-item-dialog.component.css']
})
export class AddCollaboratorProjectWorkItemDialogComponent implements OnInit {

  completed = false;
  submitted = false;
  enabled = false;

  addProjectWorkItemFormGroup: FormGroup;

  collaboratorProjectWorkItem: CollaboratorProjectWorkItem = new CollaboratorProjectWorkItem();

  constructor(
    public dialogRef: MatDialogRef<AddCollaboratorProjectWorkItemDialogComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public collaboratorProject: CollaboratorProject,
    private collaboratorService: CollaboratorService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    console.log("Selected Collaborator Project:", this.collaboratorProject);

    this.collaboratorProjectWorkItem.collaborator_id = this.collaboratorService.currentCollaborator.id;
    this.collaboratorProjectWorkItem.project_id = this.collaboratorProject.id;

    this.addProjectWorkItemFormGroup = this.formBuilder.group({
      title: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
      type: ['', Validators.compose([Validators.required])],
      alias: ['', Validators.compose([Validators.required])],
    });
  }

  workItemTitleChanged(title: String) {
    this.collaboratorProjectWorkItem.alias = this.collaboratorProjectWorkItem.title.replace(/[\W_]+/g, '_').toLowerCase();
  }

  onAddProjectWorkItemFormGroupSubmit() {
    this.collaboratorService.addNewProjectWorkItem(this.collaboratorProjectWorkItem)
    .delay(250)
    .subscribe(collaboratorProject => {
      if (collaboratorProject) {
        this.dialogRef.close(collaboratorProject);
      }
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
