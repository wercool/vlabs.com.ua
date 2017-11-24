import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { User } from '../../../../model/index';

@Component({
  selector: 'app-auth-user-dialog',
  templateUrl: './auth-user-dialog.component.html',
  styleUrls: ['./auth-user-dialog.component.css']
})
export class AuthUserDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<AuthUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public user: User
  ) { }

  ngOnInit() {
    console.log(this.user);
  }

}
