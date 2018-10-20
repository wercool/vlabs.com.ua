import { Component, OnInit, ViewChild } from '@angular/core';
import {
  MatTableDataSource,
  MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSort, MatPaginator, MatPaginatorIntl, MatSnackBar
} from '@angular/material';

import {
  UserService, AuthService
} from '../../../service';

import {
  User
} from '../../../model';

import { AuthUserDialogComponent } from './auth-user-dialog/auth-user-dialog.component';
import { EditUserDialogComponent } from './edit-user-dialog/edit-user-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, Form, NgForm } from '@angular/forms';
import { PasswordValidation } from '../../../shared/utils/password-validation';
import { DisplayMessage } from '../../../shared/models/display-message';

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

  usersDisplayedColumns = ['id', 'username', 'email', 'phoneNumber', 'firstName', 'lastName', 'authorities'];
  usersDS: MatTableDataSource<User>;

  usersDSLength = 0;
  usersDSPageSize = 5;
  usersDSCurrentPage = 0;

  @ViewChild(MatSort) sortUsersDS: MatSort;
  @ViewChild(MatPaginator) paginatorUsersDS: MatPaginator;

  // Add New User Form
  notification: DisplayMessage;
  addNewUserFormGroup: FormGroup;
  @ViewChild("addNewUserForm") addNewUserForm: NgForm;
  submitted = false;
  addNewUserFormActive = true;

  constructor(
    private translate: TranslateService,
    private userService: UserService,
    private authUserDialog: MatDialog,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit() {
    this.getAllUsers();
    this.getUsersWoAuthorities();
    this.paginatorUsersDS.page.asObservable().subscribe(event => {
      this.usersDSPageSize = event.pageSize;
      this.usersDSCurrentPage = event.pageIndex;
      this.getAllUsersPaged();
    });

    this.addNewUserFormGroup = this.formBuilder.group({
      username: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
      confirmPassword: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
      firstName: [''],
      lastName: [''],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      phoneNumber: [''],
    }, {
      validator: PasswordValidation.MatchPassword // password validation method
    });
  }

  private getAllUsersPaged():void {
    this.userService.getAllPaged(this.usersDSCurrentPage, this.usersDSPageSize)
    .subscribe(result => {
        this.usersAll = result.content;
        this.usersDSLength = result.totalElements;
        // this.usersNum = this.usersAll.length;
        this.usersNum = result.totalElements;
        this.usersDS = new MatTableDataSource<User>(this.usersAll);
        this.usersDS.sort = this.sortUsersDS;
    },
    error => {
    });
  }

  private getAllUsers():void {
    this.getAllUsersPaged();
    // this.userService.getAll()
    // .subscribe(result => {
    //     this.usersAll = result;
    //     this.usersNum = this.usersAll.length;
    //     this.usersDS = new MatTableDataSource<User>(this.usersAll);
    //     this.usersDS.sort = this.sortUsersDS;
    // },
    // error => {
    // });
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
      this.getAllUsers();
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
      this.getUsersWoAuthorities();
    });
  }

  onNewUserSubmit() {
    this.submitted = true;
    this.notification = undefined;

    let registrationObject = {
      type: 'generic'
    };

    this.authService.register(this.addNewUserFormGroup.value, registrationObject)
    // show the animation
    .delay(1000)
    .subscribe(data => {
      this.snackBar.open(data.message, 'New User', {
        panelClass: ['successSnackBar'],
        duration: 20000,
        verticalPosition: 'top'
      });
      this.submitted = false;
      this.addNewUserForm.reset();
      this.ngOnInit();
      this.addNewUserFormActive = false;
      setTimeout(() => this.addNewUserFormActive = true, 50);
    },
    error => {
      this.submitted = false;
      try {
        let errorObj = error.json();
        this.notification = { msgType: 'styles-error', msgBody: errorObj.message };
      } catch (ex) {
        console.log(error, ex);
      }
    });
  }

}
