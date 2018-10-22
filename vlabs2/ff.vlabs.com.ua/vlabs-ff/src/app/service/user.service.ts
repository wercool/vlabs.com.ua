import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { User } from '../model/user';

@Injectable()
export class UserService {

  currentUser: User = null;

  constructor(
    private apiService: ApiService,
  ) { }

  isLoggedIn() {
    return (this.currentUser) ? true : false;
  }

  initUser() {
    const promise = this.apiService.anonGet(this.apiService.APIEndpoints.getFullyQualifiedURL('public', 'refresh')).toPromise()
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
    return this.apiService.get(this.apiService.APIEndpoints.getFullyQualifiedURL('public', 'whoami')).map(user => this.currentUser = user);
  }
}
