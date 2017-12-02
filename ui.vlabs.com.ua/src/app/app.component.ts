import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from './service/api.service';
import { AuthService } from './service/auth.service';

import { environment } from '../environments/environment';

import { HTTPStatusCodes } from './shared/lib/http-status-codes'
import { MatSidenav, MatSnackBar, MatPaginatorIntl, MatAccordion, MatAccordionDisplayMode } from '@angular/material';

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
        private paginatorIntl: MatPaginatorIntl
    ) {
        translate.addLangs(["en", "ru", "ua"]);
        translate.use('en');
        if (!localStorage.getItem('vlabs-lang'))
        {
            let browserLang = translate.getBrowserLang();
            localStorage.setItem('vlabs-lang', browserLang.match(/en|ru|ua/) ? browserLang : 'en')
        }
        translate.setDefaultLang(localStorage.getItem('vlabs-lang'));

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
