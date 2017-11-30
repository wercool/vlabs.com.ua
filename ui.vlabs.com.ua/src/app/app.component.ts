import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from './service/api.service';
import { AuthService } from './service/auth.service';

import { environment } from '../environments/environment';

import { HTTPStatusCodes } from './shared/lib/http-status-codes'
import { MatSidenav, MatSnackBar } from '@angular/material';

import "rxjs/add/operator/takeWhile";
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy{

    @ViewChild('sidenav') sidenav: MatSidenav;

    private alive: boolean = true;

    constructor(
        private translate: TranslateService,
        private router: Router,
        private apiService: ApiService,
        private authService: AuthService,
        private snackBar: MatSnackBar,
    ) {
        translate.addLangs(["en", "ru"]);
        translate.setDefaultLang(localStorage.getItem('vlabs-lang') || translate.getDefaultLang());

        // let browserLang = translate.getBrowserLang();
        // translate.use(browserLang.match(/en|ru/) ? browserLang : 'en');
    }

    ngOnInit(){

        // VLabs App root component

        this.apiService.onError
        .takeWhile(() => this.alive)
        .subscribe(error => {
            switch(error.status)
            {
                case HTTPStatusCodes.NOT_FOUND:
                    this.snackBar.open(error.statusText, error.status, {
                        duration: 5000
                    }).afterDismissed().subscribe(() => {
                        if (environment.production)
                        {
                            window.location.href = '/';
                        } else {
                            console.log('Will be redirected to / in production');
                        }
                    });
                break;
                case HTTPStatusCodes.FORBIDDEN:
                    this.authService.logout().subscribe(result =>{
                        this.router.navigate(['/login', { msgType: 'error', msgBody: 'Access Forbidden' }]);
                    });
                break;
                case HTTPStatusCodes.GATEWAY_TIMEOUT:
                    this.router.navigate(['/login', { msgType: 'error', msgBody: 'Gateway Timeout' }]);
                    this.snackBar.open(error.statusText, error.status, {
                        duration: 5000
                    });
                break;
                default:
                    this.snackBar.open(error.statusText, error.status, {
                        duration: 5000
                    });
                break;
            }
        });
    }

    ngOnDestroy(): void {
        this.alive = false;
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
