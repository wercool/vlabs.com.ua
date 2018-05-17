import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { User } from '../model';

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
    const promise = this.apiService.anonGet(this.apiService.refreshTokenURL).toPromise()
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
    return this.apiService.get(this.apiService.whoamiURL).map(user => this.currentUser = user);
  }

  updateProfile() {
    return this.apiService.post(this.apiService.userProfileURL, this.currentUser).map(user => this.currentUser = user);
  }
}
