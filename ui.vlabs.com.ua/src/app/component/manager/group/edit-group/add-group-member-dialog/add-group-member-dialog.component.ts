import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { Group, User } from '../../../../../model/index';
import { GroupService } from '../../../../../service/index';

@Component({
  selector: 'add-group-member-dialog',
  templateUrl: './add-group-member-dialog.component.html',
  styleUrls: ['./add-group-member-dialog.component.css']
})
export class AddGroupMemberDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<AddGroupMemberDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public group: Group,
    private authService: GroupService
  ) { }

  ngOnInit() {
    console.log("Selected Group ID: " + this.group.id);
  }

  addGroupMembers() {

  }

}
