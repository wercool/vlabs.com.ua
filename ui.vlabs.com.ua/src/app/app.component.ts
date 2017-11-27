import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from './service/api.service';
import { AuthService } from './service/auth.service';

import { environment } from '../environments/environment';

import { HTTPStatusCodes } from './shared/lib/http-status-codes'
import { MatSidenav } from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

    @ViewChild('sidenav') sidenav: MatSidenav;

    constructor(
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
    ) { }

    ngOnInit(){
        if (this.apiService.apiError){
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

    authorizedFor(authority:string): boolean{
        return this.authService.hasAuthority(authority);
    }

    navigate(url: string){
        // console.log('navigating to: ' + url);
        this.router.navigate([url]);
        this.closeSidenav();
    }

    logout() {
        this.authService.logout().subscribe(res => {
          this.router.navigate(['/login']);
          this.closeSidenav();
        });
    }

    closeSidenav() {
        this.sidenav.close();
    }
}
