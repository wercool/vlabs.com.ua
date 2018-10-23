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
}
