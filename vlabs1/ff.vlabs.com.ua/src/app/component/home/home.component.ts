import { Component, OnInit } from '@angular/core';
import { UserService, AuthService } from '../../service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    constructor(
        private router: Router,
        private authService: AuthService,
        public userService: UserService
    ) { }

    ngOnInit() {
        if (this.userService.isLoggedIn()) {
            this.router.navigate(['/dashboard']);
        }
    }

}
