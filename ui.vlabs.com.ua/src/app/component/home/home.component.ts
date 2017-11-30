import { Component, OnInit } from '@angular/core';

import {
  UserService,
  AuthService
} from '../../service';
import { ActivatedRoute } from '@angular/router';
import { DisplayMessage } from '../../shared/models/display-message';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
  }

  authorizedFor(authority: string): boolean{
    return this.authService.hasAuthority(authority);
  }

}
