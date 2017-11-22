import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import {
  UserService,
  AuthService
} from '../../service';

import { 
  AdminMenuComponent 
} from '../index';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
    ) { }

  ngOnInit() {
  }

  get self(): HeaderComponent {
    return this;
  }

  hasSignedIn() {
    return !!this.userService.currentUser;
  }

  authorizedFor(authority:string): boolean{
    return this.authService.hasAuthority(authority);
  }

  userName() {
    const user = this.userService.currentUser;
    if (user.firstName || user.lastName) {
      return user.firstName + ' ' + user.lastName;
    } else {
      return user.username;
    }
  }

  navigate(url: string){
    console.log('navigating to: ' + url);
    this.router.navigate([url]);
  }

  logout() {
    this.authService.logout().subscribe(res => {
      this.router.navigate(['/login']);
    });
  }

}
