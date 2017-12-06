import { Component, OnInit, ViewChild, Input, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import {
  UserService,
  AuthService
} from '../../service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit {

  selectedLanguage = 'en';

  @Input() sidenav;

  constructor(
    private translate: TranslateService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    ) {
      this.selectedLanguage = localStorage.getItem('vlabs-lang') || translate.getDefaultLang();
    }

  ngOnInit() {
  }

  get self(): HeaderComponent {
    return this;
  }

  hasSignedIn() {
    return !!this.userService.currentUser;
  }

  authorizedFor(authority:string): boolean{
    return this.authService.hasAuthority(authority);
  }

  userName() {
    const user = this.userService.currentUser;
    if (user.firstName || user.lastName) {
      return user.firstName + ' ' + user.lastName;
    } else {
      return user.username;
    }
  }

  navigate(url: string){
    // console.log('navigating to: ' + url);
    this.router.navigate([url]);
  }

  logout() {
    this.authService.logout().subscribe(res => {
      this.router.navigate(['/login']);
      this.sidenav.close();
    });
  }

  switchLanguage(lang:string){
    localStorage.setItem('vlabs-lang', lang);
    this.translate.setDefaultLang(lang);
    this.translate.use(lang);
    this.translate.reloadLang(lang);
  }
}
