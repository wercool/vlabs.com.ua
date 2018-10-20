import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { UserService } from '../service';

@Injectable()
export class GuestGuard implements CanActivate {

  constructor(
      private router: Router, 
      private userService: UserService
      ) {}

  canActivate(): boolean {
    if (this.userService.currentUser) {
      this.router.navigate(['/']);
      return false;
    } else {
      return true;
    }
  }

}
