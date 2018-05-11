import { Injectable } from '@angular/core';
import { Headers, RequestMethod } from '@angular/http';
import { ApiService } from './api.service';

@Injectable()
export class AuthService {

  constructor(
    private apiService: ApiService
  ) { }

  userExists(username: string) {
    return this.apiService.anonGet(this.apiService.userExistsURL.replace('{username}', username));
  }

  login(credentials) {
    console.log(credentials);
    const body = `username=${credentials.username}&password=${credentials.password}`;
    const headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    return this.apiService.post(this.apiService.loginURL, body, headers);
  }
}
