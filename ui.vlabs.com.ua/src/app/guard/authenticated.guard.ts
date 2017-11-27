import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { UserService } from '../service';

@Injectable()
export class AuthenticatedGuard implements CanActivate {

  constructor(
      private router: Router, 
      private userService: UserService
      ) {}

  canActivate(): boolean {
    if (this.userService.currentUser) {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }

}
