import { Component, OnInit } from '@angular/core';

import {
  UserService,
  AuthService
} from '../../service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) { }

  ngOnInit() {
  }

  authorizedFor(authority: string): boolean{
    return this.authService.hasAuthority(authority);
  }

}
