import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../service';

@Injectable()
export class AdminGuard implements CanActivate {

  constructor(
      private router: Router, 
      private authService: AuthService
      ) {}

  canActivate(): boolean {
    if (this.authService.hasAuthority('ADMIN')) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }

}
