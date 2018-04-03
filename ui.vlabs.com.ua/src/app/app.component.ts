import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from './service/api.service';
import { AuthService } from './service/auth.service';

import { environment } from '../environments/environment';

import { HTTPStatusCodes } from './shared/lib/http-status-codes'
import { MatSidenav, MatSnackBar, MatPaginatorIntl, MatAccordion, MatAccordionDisplayMode } from '@angular/material';

import "rxjs/add/operator/takeWhile";
import { TranslateService } from '@ngx-translate/core';
import { UserService } from './service/index';
import { HttpErrorResponse } from '@angular/common/http/src/response';

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
        private userService: UserService,
        private snackBar: MatSnackBar,
        private paginatorIntl: MatPaginatorIntl
    ) {
        translate.addLangs(["en", "ru", "ua"]);
        if (!localStorage.getItem('vlabs-lang'))
        {
            let browserLang = translate.getBrowserLang();
            localStorage.setItem('vlabs-lang', browserLang.match(/en|ru|ua/) ? browserLang : 'en');
            translate.use(localStorage.getItem('vlabs-lang') ? localStorage.getItem('vlabs-lang') : 'en');
            translate.setDefaultLang(localStorage.getItem('vlabs-lang') ? localStorage.getItem('vlabs-lang') : 'en');
        }
        else
        {
            translate.use(localStorage.getItem('vlabs-lang'));
            translate.setDefaultLang(localStorage.getItem('vlabs-lang'));
        }

        //Angular2 Material Internationalization
        translate.get('paginatorIntl').subscribe((result: any) => {
            this.paginatorIntl.itemsPerPageLabel = result.itemsPerPageLabel;
            this.paginatorIntl.nextPageLabel = result.nextPageLabel;
            this.paginatorIntl.previousPageLabel = result.previousPageLabel;
            this.paginatorIntl.changes.next();
        });
    }

    ngOnInit(){
        // VLabs App root component

        this.sidenav.mode = (window.screen.width > 1024) ? 'side' : 'over';

        this.apiService.onError
        .takeWhile(() => this.alive)
        .subscribe(error => {
            switch(error.status)
            {
                case HTTPStatusCodes.NOT_FOUND:
                    error.statusText = "Resource not found";
                    this.snackBar.open(error.statusText, error.status, {
                        duration: 2000
                    }).afterDismissed().subscribe(() => {
                        if (environment.production) {
                            this.router.navigate(['/login']);
                        } else {
                            console.log('On production will be redirected to /login');
                        }
                    });
                break;
                case HTTPStatusCodes.FORBIDDEN:
                    this.snackBar.open('ACCESS FORBIDDEN', error.statusText + ': ' + error.status, {
                        duration: 2000
                    }).afterDismissed().subscribe(() => {
                        if (environment.production) {
                            this.authService.logout().subscribe(res => {
                                this.router.navigate(['/login']);
                                this.sidenav.close();
                            });
                        } else {
                            console.log('On production will be redirected to /login');
                        }
                    });
                break;
                case HTTPStatusCodes.GATEWAY_TIMEOUT:
                    this.snackBar.open(error.statusText, error.status, {
                        duration: 5000
                    });
                break;
                case HTTPStatusCodes.CONFLICT:
                    this.snackBar.open(error.statusText, error.status, {
                        duration: 1000
                    });
                break;
                case HTTPStatusCodes.UNAUTHORIZED:
                    this.snackBar.open(error.statusText, error.status, {
                        duration: 2000
                    });
                break;
                default:
                    if (environment.production) {
                        this.snackBar.open(error.statusText, error.status, {
                            duration: 5000
                        });
                    } else {
                        let errorDetails = JSON.parse(error.headers.get('errorDetails'));
                        if (errorDetails) {
                            this.snackBar.open(errorDetails.detailMessage, error.status, {
                                duration: 10000
                            });
                        } else {
                            this.snackBar.open(error.statusText, error.status, {
                                duration: 1000
                            });
                        }
                    }
                    this.router.navigate(['/']);
                break;
            }
        });
    }

    isLoggedIn(): boolean {
        return (this.userService.currentUser) ? true : false;
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
        if (this.sidenav.mode == 'over') this.closeSidenav();
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
