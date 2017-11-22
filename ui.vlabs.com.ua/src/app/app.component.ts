import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from './service/api.service';
import { AuthService } from './service/auth.service';

import { environment } from '../environments/environment';

import { HTTPStatusCodes } from './shared/lib/http-status-codes'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'app';

    constructor(
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
    ) { }

    ngOnInit()
    {
        if (this.apiService.apiError)
        {
            this.apiService.apiError.subscribe({
              // next: val => console.log(val),
              // complete: () => console.log('Complete!'),
              error: error => {
                  switch(error.status)
                  {
                      case HTTPStatusCodes.FORBIDDEN:
                          this.authService.logout().subscribe(result =>{
                              this.router.navigate(['/login', { msgType: 'error', msgBody: 'Access Forbidden' }]);
                          });
                      break;
                  }
              }
            });
        }
    }
}
