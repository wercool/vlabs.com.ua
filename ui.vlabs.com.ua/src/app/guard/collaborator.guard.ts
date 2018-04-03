import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../service';

@Injectable()
export class CollaboratorGuard implements CanActivate {

  constructor(
      private router: Router, 
      private authService: AuthService
      ) {}

  canActivate(): boolean {
    if (this.authService.hasAuthority('COLLABORATOR')) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }

}
