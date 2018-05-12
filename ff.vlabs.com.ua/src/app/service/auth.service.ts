import { Injectable } from '@angular/core';
import { Headers, RequestMethod } from '@angular/http';

import { ApiService } from './api.service';
import { UserService } from './user.service';

@Injectable()
export class AuthService {

  constructor(
    private apiService: ApiService,
    private userService: UserService,
  ) { }

  userExists(username: string) {
    return this.apiService.anonGet(this.apiService.userExistsURL.replace('{username}', username));
  }

  login(credentials) {
    const body = `username=${credentials.username}&password=${credentials.password}`;
    const headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    return this.apiService.post(this.apiService.loginURL, body, headers);
  }

  logout() {
    return this.apiService.post(this.apiService.logoutURL, {}).map(() => { this.userService.currentUser = null; });
  }
}
