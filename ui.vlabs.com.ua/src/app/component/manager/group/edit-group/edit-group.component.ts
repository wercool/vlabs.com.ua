import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatSnackBar, MatDialog, MatTableDataSource, 
    MatDialogRef, MAT_DIALOG_DATA, 
    MatSort, MatPaginator, MatPaginatorIntl } from '@angular/material';
import { DisplayMessage } from '../../../../shared/models/display-message';
import { Group, User } from '../../../../model/index';
import { GroupService } from '../../../../service/index';

import { AddGroupMemberDialogComponent } from './add-group-member-dialog/add-group-member-dialog.component';

@Component({
  selector: 'app-grpup-eclass',
  templateUrl: './edit-group.component.html',
  styleUrls: ['./edit-group.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class EditGroupComponent implements OnInit {

    private sub: any;
    private group: Group;

    generalGroupFormGroup: FormGroup;

    submitted = false;
    completed = false;
  
      /**
     * Notification message from received
     * form request or router
     */
    notification: DisplayMessage;
  

    groupMembersDisplayedColumns = ['id', 'username', 'email', 'phoneNumber', 'firstName', 'lastName'];
    groupMembersDS: MatTableDataSource<User>;
 
    constructor(
      private route: ActivatedRoute,
      private router: Router,
      private snackBar: MatSnackBar,
      private formBuilder: FormBuilder,
      private groupService: GroupService,
      private addGroupMemberDialog: MatDialog
    ) { }
  
    ngOnInit() {
        this.completed = false;
        this.generalGroupFormGroup = this.formBuilder.group({
            name: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
        });

        this.sub = this.route.params.subscribe(params => {
            this.setGroup(params['id']);
        });
    }

    setGroup(id: number) {
        this.groupService.getById(id)
        .delay(250)
        .subscribe(group => {
          this.group = group;
          this.completed = true;
          console.log(this.group);
        },
        error => {
          this.snackBar.open(error.json().message, 'SERVER ERROR', {
            panelClass: ['errorSnackBar'],
            duration: 1000,
            verticalPosition: 'top'
          });
        });
    }

    onGeneralGroupFormGroupSubmit() {
        this.submitted = true;

        this.groupService.update(this.group)
        // show the animation
        .delay(250)
        .subscribe(group => {
            this.group = group;
            this.submitted = false;
            this.notification = { msgType: 'styles-success', msgBody: '<b>' + group.name + '</b>' + ' successfully updated' };
            setTimeout(() => { this.notification = undefined; }, 2000);
        },
        error => {
          this.submitted = false;
          this.snackBar.open(error.json().message, 'SERVER ERROR', {
            panelClass: ['errorSnackBar'],
            duration: 1000,
            verticalPosition: 'top'
          });
        });
    }

    openAddMemberDialog() {
        let dialogRef = this.addGroupMemberDialog.open(AddGroupMemberDialogComponent, {
            width: '80%',
            data: this.group
          });
          dialogRef.afterClosed().subscribe(result => {
            // console.log(result);
          });
    }

}