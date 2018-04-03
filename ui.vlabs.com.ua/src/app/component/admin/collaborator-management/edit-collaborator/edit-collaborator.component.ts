import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatSnackBar, MatDialog, MatTableDataSource, 
    MatDialogRef, MAT_DIALOG_DATA, 
    MatSort, MatPaginator, MatPaginatorIntl } from '@angular/material';
import { DisplayMessage } from '../../../../shared/models/display-message';

import { Collaborator } from '../../../../model';

@Component({
  selector: 'app-edit-collaborator',
  templateUrl: './edit-collaborator.component.html',
  styleUrls: ['./edit-collaborator.component.css']
})
export class EditCollaboratorComponent implements OnInit {

    private sub: any;
    private collaborator: Collaborator;

    generalCollaboratorFormGroup: FormGroup;

      /**
     * Notification message from received
     * form request or router
     */
    notification: DisplayMessage;

    submitted = false;
    completed = false;

 
    constructor(
      private route: ActivatedRoute,
      private router: Router,
      private snackBar: MatSnackBar,
      private formBuilder: FormBuilder,
    ) { }
  
    ngOnInit() {
        this.completed = false;
        this.generalCollaboratorFormGroup = this.formBuilder.group({
            alias: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
        });
    }

    setCollaborator(collaborator: Collaborator) {
        this.collaborator = collaborator;
    }

}