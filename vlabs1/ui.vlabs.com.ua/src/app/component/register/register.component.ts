import { Inject, ViewEncapsulation, ViewChild } from '@angular/core';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MatSnackBar, MatSelect } from '@angular/material';

import { DisplayMessage } from '../../shared/models/display-message';
import { PasswordValidation } from '../../shared/utils/password-validation';

import { HTTPStatusCodes } from '../../shared/lib/http-status-codes'

import {
  UserService,
  AuthService,
  SubscriptionService
} from '../../service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RegisterComponent implements OnInit, OnDestroy {

  private sub: any;

  form: FormGroup;

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

  /* Collaborator registration */
  collaboratorId: number = undefined;

  registrationMethod = 'Generic';

  invSubCards: any[];
  invSubCardsRetrieving = false;

  regMethods = [
    {value: 'Generic'},
  ];

  @ViewChild ('registrationMethodSelector') registrationMethodSelector: MatSelect;

  qrDecoded = false;

  existingUserSubscribing = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private subscriptionService: SubscriptionService,
    private snackBar: MatSnackBar
    ) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      if(params['collaboratorId']) {
        this.collaboratorId = params['collaboratorId'];
      }
    });
    this.form = this.formBuilder.group({
      username: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
      confirmPassword: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
      firstName: [''],
      lastName: [''],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      phoneNumber: [''],
    }, {
      validator: PasswordValidation.MatchPassword // password validation method
    });
  }

  ngOnDestroy() {

  }

  onUsernameFocusLost() {
    if (Validators.email(this.form.controls.username) === null)
    {
      // null returned from validator meas no error = valid email is entered
      this.form.controls.email.setValue(this.form.controls.username.value);
    }
  }

  registrationMethodChanged(event) {
    let self = this;
    if (event.value == "QR Code Invitation") {
      if (navigator.getUserMedia) {
        navigator.getUserMedia(
          {
            video: true
          },
          function(localMediaStream) {
            localMediaStream.getTracks().forEach(function (track) { track.stop(); })
            self.registrationMethod = event.value;
          },
          function(err) {
            self.snackBar.open("There is no default camera present", 'No Video', {
              panelClass: ['errorSnackBar'],
              duration: 3000,
              verticalPosition: 'top'
            });
            self.registrationMethodSelector.value = 'Generic';
          }
        );
      
      } else {
        self.snackBar.open("There is no default camera present", 'No Video', {
          panelClass: ['errorSnackBar'],
          duration: 3000,
          verticalPosition: 'top'
        });
        self.registrationMethodSelector.value = 'Generic';
      }

    } else {
      self.registrationMethod = event.value;
    }
  }

  onSubmit() {
    this.notification = undefined;
    this.submitted = true;

    let registrationObject = {
      type: 'generic'
    };

    if (this.collaboratorId) { 
      registrationObject['type'] = 'collaborator',
      registrationObject['collaboratorId'] = this.collaboratorId
    }

    this.authService.register(this.form.value, registrationObject)
    // show the animation
    .delay(1000)
    .subscribe(data => {
      this.snackBar.open(data.message, 'Registration', {
        panelClass: ['successSnackBar'],
        duration: 20000,
        verticalPosition: 'top'
      });
      this.router.navigate(['/']);
    },
    error => {
      this.submitted = false;
      try {
        let errorObj = error.json();
        this.notification = { msgType: 'styles-error', msgBody: errorObj.message };
      } catch (ex) {
        console.log(error, ex);
      }
    });
  }

}
