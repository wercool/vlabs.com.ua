import { Component, OnInit } from '@angular/core';

import {
  UserService
} from '../../../service';

import {
  User
} from '../../../model';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {

  usersWoAuthorities: User[];
  usersWoAuthoritiesNum: number = 0;

  constructor(
    private userService:UserService
  ) { }

  ngOnInit() {
    this.userService.getAllWoAuthorities()
    .subscribe(result => {
      this.usersWoAuthorities = result;
      this.usersWoAuthoritiesNum = this.usersWoAuthorities.length;
    },
    error => {
    });
  }

}
