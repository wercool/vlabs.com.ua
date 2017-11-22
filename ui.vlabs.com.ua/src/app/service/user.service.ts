import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';

import { HTTPStatusCodes } from '../shared/lib/http-status-codes'

import { 
  User,
  Authority
} from '../model/index';

@Injectable()
export class UserService {

  currentUser:User = null;

  constructor(
    private apiService: ApiService,
    private config: ConfigService
    ) { }

  initUser() {
    const promise = this.apiService.anonGet(this.config.refresh_token_url).toPromise()
    .then(res => {
      if (res.access_token !== null) {
        return this.getMyInfo().toPromise()
        .then(user => {
          console.log(user);
          this.currentUser = user;
        });
      }
    })
    .catch(() => null);
    return promise;
  }

  getMyInfo() {
    return this.apiService.get(this.config.whoami_url).map(user => this.currentUser = user);
  }

  getAll() {
    return this.apiService.get(this.config.users_url);
  }
  
  getAllWoAuthorities() {
    return this.apiService.get(this.config.users_wo_authorities_url);
  }

}
