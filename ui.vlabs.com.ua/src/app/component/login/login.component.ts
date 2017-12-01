import { Inject } from '@angular/core';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

import { HTTPStatusCodes } from '../../shared/lib/http-status-codes'

import { DisplayMessage } from '../../shared/models/display-message';

import {
  UserService,
  AuthService
} from '../../service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  form: FormGroup;

  selectedLanguage = 'en';

  /**
   * Boolean used in telling the UI
   * that the form has been submitted
   * and is awaiting a response
   */
  submitted = false;

  /**
   * Notification message from received
   * form request or router
   */
  notification: DisplayMessage;

  constructor(
      private translate: TranslateService,
      private router: Router,
      private route: ActivatedRoute,
      private formBuilder: FormBuilder,
      private userService: UserService,
      private authService: AuthService
    ) {
      this.selectedLanguage = localStorage.getItem('vlabs-lang') || translate.getDefaultLang();
    }

  ngOnInit() {
    this.route.params
    .subscribe((params: DisplayMessage) => {
      this.notification = params;
    });

    this.form = this.formBuilder.group({
      username: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(64)])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])]
    });
  }

  ngOnDestroy() {

  }

  onSubmit() {
    /**
     * Innocent until proven guilty
     */
    this.notification = undefined;
    this.submitted = true;

    this.authService.login(this.form.value)
    // show the animation
    .delay(1000)
    .subscribe(data => {
        this.userService.getMyInfo().subscribe(
        user => {
          this.router.navigate(['/']);
        },
        error => {
            this.authService.logout().subscribe(result =>{
                this.submitted = false;
                this.notification = { msgType: 'error', msgBody: 'Access Forbidden' }
            });
        });
    },
    error => {
      this.submitted = false;
      if (error.status == HTTPStatusCodes.UNAUTHORIZED)
      {
        this.notification = { msgType: 'error', msgBody: 'Username or password is incorrect' };
      }
      else{
        this.notification = { msgType: 'error', msgBody: error.statusText };
      }
    });

  }

  switchLanguage(lang:string){
    localStorage.setItem('vlabs-lang', lang);
    this.translate.use(lang);
  }

  onRegister() {
    this.router.navigate(['/register']);
  }
}
