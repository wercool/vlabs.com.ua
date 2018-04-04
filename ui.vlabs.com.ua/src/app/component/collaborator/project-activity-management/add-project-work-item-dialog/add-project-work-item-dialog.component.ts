import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar,
  MatTableDataSource, MatFormFieldControl, MatInput } from '@angular/material';

import { CollaboratorProject, CollaboratorProjectWorkItem } from '../../../../model/index';
import { CollaboratorService } from '../../../../service/index';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

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

  collaboratorProjectWorkItems: CollaboratorProjectWorkItem[];
  newCollaboratorProjectWorkItem: CollaboratorProjectWorkItem = new CollaboratorProjectWorkItem();

  @ViewChild('alias') aliasInput: MatInput;
  aliasExistsMessage: string = undefined;
  aliasExistsInfoMessage: string = undefined;

  constructor(
    public dialogRef: MatDialogRef<AddCollaboratorProjectWorkItemDialogComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public collaboratorProjectAndWorkItems: any,
    private collaboratorService: CollaboratorService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    // console.log("Selected Collaborator Project:", this.collaboratorProjectAndWorkItems.collaboratorProject);

    this.collaboratorProjectWorkItems = <CollaboratorProjectWorkItem[]> this.collaboratorProjectAndWorkItems.collaboratorProjectWorkItems;

    this.newCollaboratorProjectWorkItem.collaborator_id = this.collaboratorService.currentCollaborator.id;
    this.newCollaboratorProjectWorkItem.project_id = this.collaboratorProjectAndWorkItems.collaboratorProject.id;

    this.addProjectWorkItemFormGroup = this.formBuilder.group({
      title: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
      type: ['', Validators.compose([Validators.required])],
      alias: ['', Validators.compose([Validators.required])],
      notes: [''],
    }, {
      validator: this.checkAliasAlreadyExists.bind(this)
    });
  }

  checkAliasAlreadyExists() {
    this.aliasExistsMessage = undefined;
    this.aliasExistsInfoMessage = undefined;
    for (let workItem of this.collaboratorProjectWorkItems) {
      if (workItem.alias == this.newCollaboratorProjectWorkItem.alias) {
        this.aliasExistsMessage = 'Alias already exitst in your Project sub-directory';
        this.aliasExistsInfoMessage = 'Change the title to get unique alias';
        return null;
      }
    }
  }

  workItemTitleChanged() {
    if (!this.newCollaboratorProjectWorkItem.title) return;
    this.newCollaboratorProjectWorkItem.alias = this.newCollaboratorProjectWorkItem.type + '_' + this.newCollaboratorProjectWorkItem.title.replace(/[\W_]+/g, '_').toLowerCase();
  }

  onAddProjectWorkItemFormGroupSubmit() {
    this.collaboratorService.addNewProjectWorkItem(this.newCollaboratorProjectWorkItem)
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
