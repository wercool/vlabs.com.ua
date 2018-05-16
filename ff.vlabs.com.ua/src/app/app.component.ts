import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';

import { environment } from '../environments/environment';
import { UserService, AuthService, ApiService, ToolbarLabelService } from './service';
import { Router } from '@angular/router';
import "rxjs/add/operator/takeWhile";
import { MatSnackBar } from '@angular/material';

import { HTTPStatusCodes } from './shared/lib/http-status-codes';
import { User } from './model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit, OnDestroy {

    alive = true;

    title = environment.title;

    copyrightYear = (new Date()).getFullYear();

    routeLinks: any[];
    selectedTabIndex = -1;

    @ViewChild('toolbarLabelElement') private toolbarLabelElement : ElementRef; 

    constructor(
      private router: Router,
      public toolbarLabelService: ToolbarLabelService,
      private snackBar: MatSnackBar,
      private apiService: ApiService,
      private authService: AuthService,
      public userService: UserService,
    ) {
        this.routeLinks = [
            {
                label: 'My HelpClips',
                path: './helpclips',
                icon: 'airplay',
                index: 0
            }, {
                label: 'HelpClips Market',
                path: './helpclips-market',
                icon: 'local_mall',
                index: 1
            }
        ];
    }

    ngOnInit() {
        this.toolbarLabelService.onToolbarLabelChanged
        .takeWhile(() => this.alive)
        .subscribe(label => {
            if (this.toolbarLabelElement) {
                this.toolbarLabelElement.nativeElement.innerHTML = label;
            }
        });

        this.apiService.onError
        .takeWhile(() => this.alive)
        .subscribe(error => {
            switch(error.status)
            {
                case HTTPStatusCodes.FORBIDDEN:
                    this.snackBar["opened"] = true;
                    this.snackBar.open('ACCESS FORBIDDEN', error.statusText + ': ' + error.status, {
                        duration: 2000
                    }).afterDismissed().subscribe(() => {
                        this.authService.logout().subscribe(res => {
                            this.router.navigate(['/']);
                        });
                        this.snackBar["opened"] = false;
                    });
            }
        });
    }

    ngOnDestroy(): void {
        this.alive = false;
    }

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


    tabSelectionChanged(event){
        let selectedTab = event.tab;
        switch (selectedTab.textLabel) {
        case 'My HelpClips':
            this.router.navigate(['/helpclips']);
        break;
        case 'HelpClips Market':
            this.router.navigate(['/helpclips-market']);
        break;
        }
    }
}
