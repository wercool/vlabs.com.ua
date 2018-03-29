import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatSnackBar, MatDialog, MatTableDataSource, 
    MatDialogRef, MAT_DIALOG_DATA, 
    MatSort, MatPaginator, MatPaginatorIntl } from '@angular/material';
import { DisplayMessage } from '../../../../shared/models/display-message';
import { Group, User, UserItem } from '../../../../model/index';
import { GroupService } from '../../../../service/index';

import { AddGroupMemberDialogComponent } from './add-group-member-dialog/add-group-member-dialog.component';
import { ConfirmationDialog } from '../../../dialogs/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-edit-group',
  templateUrl: './edit-group.component.html',
  styleUrls: ['./edit-group.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class EditGroupComponent implements OnInit {

    private sub: any;
    private group: Group;

    groupMembersItems: UserItem[] = [];

    generalGroupFormGroup: FormGroup;

    submitted = false;
    completed = false;
    removeMember = false;

      /**
     * Notification message from received
     * form request or router
     */
    notification: DisplayMessage;
  

    groupMembersDisplayedColumns = ['id', 'username', 'email', 'phoneNumber', 'firstName', 'lastName'];
    groupMembersDS: MatTableDataSource<UserItem>;
 
    constructor(
      private route: ActivatedRoute,
      private router: Router,
      private snackBar: MatSnackBar,
      private formBuilder: FormBuilder,
      private groupService: GroupService,
      private addGroupMemberDialog: MatDialog,
      private confirmationDialog: MatDialog
    ) { }
  
    ngOnInit() {
        this.completed = false;
        this.generalGroupFormGroup = this.formBuilder.group({
            name: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
        });

        this.sub = this.route.params.subscribe(params => {
          this.groupService.getById(params['id'])
          .delay(250)
          .subscribe(group => {
            this.setGroup(group);
            this.completed = true;
            // console.log(this.group);
          },
          error => {
            this.snackBar.open(error.json().message, 'SERVER ERROR', {
              panelClass: ['errorSnackBar'],
              duration: 1000,
              verticalPosition: 'top'
            });
          });
        });
    }

    setGroup(group: Group) {
      this.group = group;
      this.groupMembersItems = [];
      for (let groupMember of this.group.members) {
        let groupMemberItem: UserItem = <UserItem> groupMember;
        groupMemberItem.checked = false;
        this.groupMembersItems.push(groupMemberItem);
      }
      this.groupMembersDS = new MatTableDataSource<UserItem>(this.groupMembersItems);
      this.checkSelected();
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
          dialogRef.afterClosed().subscribe(group => {
            if (group) {
              this.setGroup(group);
            }
          });
    }

    checkSelected() {
      this.removeMember = false;
      for (let groupMemberItem of this.groupMembersItems) {
        if (groupMemberItem.checked) {
          this.removeMember = true;
        }
      }
    }

    removeSelectedMembers() {
      let dialogRef = this.confirmationDialog.open(ConfirmationDialog, {
        width: '80%',
        data: "Confirm please Group Members deletion"
      });
      dialogRef.afterClosed().subscribe(confirmed => {
        if (confirmed) {
          let removeGroupMembers:User[] = [];
          for (let groupMemberItem of this.groupMembersItems) {
            if (groupMemberItem.checked) {
              let removeGroupMember:User = new User().map(groupMemberItem);
              removeGroupMembers.push(removeGroupMember);
            }
          }
          // console.log(this.groupMembersItems);
      
          this.submitted = true;
          this.groupService.removeGroupMembers(this.group.id, removeGroupMembers)
          .delay(250)
          .subscribe(group => {
            this.setGroup(group);
            this.submitted = false;
          },
          error => {
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