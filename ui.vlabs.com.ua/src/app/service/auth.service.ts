import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { ApiService } from './api.service';
import { ConfigService } from './config.service';
import { UserService } from './user.service';

import { 
  User,
  Authority
} from '../model/index';

@Injectable()
export class AuthService {

  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private config: ConfigService
    ) { }

  register(user) {
    const body = user;
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.apiService.post(this.config.register_url, body, headers);
  }

  login(user) {
    const body = `username=${user.username}&password=${user.password}`;
    const headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    return this.apiService.post(this.config.login_url, body, headers);
  }

  logout() {
    return this.apiService.post(this.config.logout_url, {})
          .map(() => {
            this.userService.currentUser = null;
          });
  }

  hasAuthority(authority:string): boolean{
    if (this.userService.currentUser)
    {
      for (let grantedRole of this.userService.currentUser.authorities)
      {
        if(grantedRole.authority === 'ROLE_' + authority)
        {
          return true;
        }
      }
      return false;
    }
    else
    {
      return false;
    }
  }

  changePassowrd(passwordChanger) {
    return this.apiService.post(this.config.change_password_url, passwordChanger);
  }

}
