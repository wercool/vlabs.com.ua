import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar,
  MatTableDataSource } from '@angular/material';

import { Group, User, UserItem } from '../../../../../model/index';
import { GroupService } from '../../../../../service/index';

@Component({
  selector: 'add-group-member-dialog',
  templateUrl: './add-group-member-dialog.component.html',
  styleUrls: ['./add-group-member-dialog.component.css']
})
export class AddGroupMemberDialogComponent implements OnInit {

  completed = false;
  submitted = false;
  enabled = false;

  nonMembers: User[] = [];
  nonMembersItems: UserItem[] = [];

  potentialGroupMembersDisplayedColumns = ['id', 'username', 'email', 'phoneNumber', 'firstName', 'lastName'];
  potentialGroupMembersDS: MatTableDataSource<UserItem> = new MatTableDataSource<UserItem>([]);

  constructor(
    public dialogRef: MatDialogRef<AddGroupMemberDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public group: Group,
    private groupService: GroupService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    console.log("Selected Group:", this.group);

    this.groupService.getNonMemebers(this.group.id)
    .delay(250)
    .subscribe(nonMembers => {
      this.nonMembers = nonMembers;
      this.completed = true;
      // console.log(this.nonMembers);
      for (let nonMember of this.nonMembers) {
        let nonMemberItem: UserItem = <UserItem> nonMember;
        nonMemberItem.checked = false;
        this.nonMembersItems.push(nonMemberItem);
      }
      this.potentialGroupMembersDS = new MatTableDataSource<UserItem>(this.nonMembersItems);
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

  checkSelected() {
    this.enabled = false;
    for (let nonMemberItem of this.nonMembersItems) {
      if (nonMemberItem.checked) {
        this.enabled = true;
      }
    }
  }

  addGroupMembers() {
    let newGroupMembers:User[] = [];
    for (let nonMemberItem of this.nonMembersItems) {
      if (nonMemberItem.checked) {
        let newGroupMember:User = new User().map(nonMemberItem);
        newGroupMembers.push(newGroupMember);
      }
    }
    // console.log(newGroupMembers);

    this.submitted = true;
    this.groupService.addGroupMembers(this.group.id, newGroupMembers)
    .delay(250)
    .subscribe(group => {
      this.dialogRef.close(group);
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
