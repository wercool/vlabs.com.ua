import { Component, OnInit, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatChipInputEvent } from '@angular/material';
import {ENTER, COMMA} from '@angular/cdk/keycodes';


import { User } from '../../../../model/index';
import { UserService, AuthService } from '../../../../service/index';

@Component({
  selector: 'app-edit-user-dialog',
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.css']
})
export class EditUserDialogComponent implements OnInit {

    /**
   * Boolean used in telling the UI
   * that the form has been submitted
   * and is awaiting a response
   */
  submitted = false;

  hasAuthority: boolean = false;

  grantedAuthorities: any[] = [];
  grantedAuthoritiesSeparatorKeysCodes = [ENTER, COMMA];
  grantedAuthoritiesSelectable: boolean = false;
  grantedAuthoritiesRemovable: boolean = true;

  profilePhoto: any = null;

  constructor(
    public dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public user: User,
    private userService: UserService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    // console.log(this.user);
    this.hasAuthority = this.authService.hasAuthority('ADMIN');

    this.setAuthoritiesInView();
    if(window.innerWidth > 375)
    {
      this.getProfilePhoto();
    }
  }

  getProfilePhoto(){
    this.userService.getProfilePhotoByUserId(this.user.id)
    .subscribe(pfofilePhoto => {
      this.profilePhoto = pfofilePhoto.imageData;
    },
    error => {
      
    });
  }

  setAuthoritiesInView(){
    this.grantedAuthorities = this.user.authorities;
  }

  addAuthority(event: MatChipInputEvent): void {
    let input = event.input;
    let value = event.value;

    if ((value || '').trim())
    {
      value = value.toUpperCase();
      if (!value.startsWith('ROLE_'))
      {
        value = 'ROLE_' + value;
      }
      if (value == 'ROLE_USER' || 
          value == 'ROLE_MANAGER'
        )
      var alreadyHasAuthority = false;
      for (let key in this.user.authorities) {
        if (this.user.authorities[key].authority == value)
        {
          alreadyHasAuthority = true;
          break;
        }
      }
      if (!alreadyHasAuthority)
        this.grantedAuthorities.push({ authority: value.trim() });
    }
    if (input) {
      input.value = '';
    }
  }

  removeAuthority(authority: any): void {
    let index = this.grantedAuthorities.indexOf(authority);
    if (index >= 0) {
      this.grantedAuthorities.splice(index, 1);
    }
  }

  updateAuthorities(){
    this.submitted = true;
    var userAuthorities: string[] = [];
    for (let key in this.grantedAuthorities) {
      userAuthorities.push(this.grantedAuthorities[key].authority);
    }
    this.userService.updateAuthorities(userAuthorities, this.user.id)
    //animation
    .delay(500)
    .subscribe(user => {
      this.user = user;
      this.setAuthoritiesInView();
      this.submitted = false;
    },
    error => {
      this.submitted = false;
    });
  }

  resetPasswordAction() {
    this.submitted = true;
    this.userService.resetPassword(this.user.id)
    //animation
    .delay(500)
    .subscribe(result => {
      this.submitted = false;
    },
    error => {
      this.submitted = false;
    });
  }

  activateAction(){
    this.user.enabled = true;

    this.submitted = true;
    this.userService.updateUser(this.user)
    //animation
    .delay(500)
    .subscribe(response => {
      this.submitted = false;
    },
    error => {
      this.submitted = false;
    });
  }

  deActivateAction(){
    this.user.enabled = false;

    this.submitted = true;
    this.userService.updateUser(this.user)
    //animation
    .delay(500)
    .subscribe(response => {
      this.submitted = false;
    },
    error => {
      this.submitted = false;
    });
  }
}
