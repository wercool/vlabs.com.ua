import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../service';

@Injectable()
export class CollaboratorManagerGuard implements CanActivate {

  constructor(
      private router: Router, 
      private authService: AuthService
      ) {}

  canActivate(): boolean {
    if (this.authService.hasAuthority('ADMIN') || this.authService.hasAuthority('COLLABORATOR_MANAGER')) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }

}
