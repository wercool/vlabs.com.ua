import { Component, OnInit } from '@angular/core';
import {
  MatTableDataSource,
  MatDialog, MatDialogRef, MAT_DIALOG_DATA
} from '@angular/material';

import {
  UserService
} from '../../../service';

import {
  User
} from '../../../model';

import { AuthUserDialogComponent } from './auth-user-dialog/auth-user-dialog.component';
import { EditUserDialogComponent } from './edit-user-dialog/edit-user-dialog.component';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {

  usersAll: User[];
  usersNum: number = 0;

  usersWoAuthorities: User[];
  usersWoAuthoritiesNum: number = 0;

  usersWoAuthoritiesDisplayedColumns = ['id', 'username', 'email', 'phoneNumber', 'firstName', 'lastName'];
  usersWoAuthoritiesDS: MatTableDataSource<User>;

  usersDisplayedColumns = ['id', 'username', 'email', 'phoneNumber', 'firstName', 'lastName'];
  usersDS: MatTableDataSource<User>;

  constructor(
    private userService: UserService,
    private authUserDialog: MatDialog
  ) { }

  ngOnInit() {
    this.getAllUsers();
    this.getUsersWoAuthorities();
  }

  private getAllUsers():void {
    this.userService.getAll()
    .subscribe(result => {
        this.usersAll = result;
        this.usersNum = this.usersAll.length;
        this.usersDS = new MatTableDataSource<User>(this.usersAll);
    },
    error => {
    });
  }

  private getUsersWoAuthorities():void {
    this.userService.getAllWoAuthorities()
    .subscribe(result => {
        this.usersWoAuthorities = result;
        this.usersWoAuthoritiesNum = this.usersWoAuthorities.length;
        this.usersWoAuthoritiesDS = new MatTableDataSource<User>(this.usersWoAuthorities);
    },
    error => {
    });
  }

  openUserActivationDialog(selectedUser:User): void{
    // console.log(selectedUser);
    let dialogRef = this.authUserDialog.open(AuthUserDialogComponent, {
      width: '80%',
      data: selectedUser
    });
    dialogRef.afterClosed().subscribe(result => {
      // console.log(result);
      this.getUsersWoAuthorities();
    });
  }

  openUserEditDialog(selectedUser:User): void{
    // console.log(selectedUser);
    let dialogRef = this.authUserDialog.open(EditUserDialogComponent, {
      width: '80%',
      data: selectedUser
    });
    dialogRef.afterClosed().subscribe(result => {
      // console.log(result);
      this.getAllUsers();
    });
  }
}
