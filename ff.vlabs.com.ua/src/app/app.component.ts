import { Component } from '@angular/core';

import { environment } from '../environments/environment';
import { UserService, AuthService } from './service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
    title = environment.title;

    copyrightYear = (new Date()).getFullYear();

    constructor(
      private router: Router,
      private authService: AuthService,
      public userService: UserService
    ) {}

    gotoLogout() {
      this.authService.logout().subscribe(res => {
        this.router.navigate(['/']);
      });
    }
  
    gotoProfile() {
      this.router.navigate(['/profile']);
    }
  
    gotoDashboard() {
      this.router.navigate(['/dashboard']);
    }
}
