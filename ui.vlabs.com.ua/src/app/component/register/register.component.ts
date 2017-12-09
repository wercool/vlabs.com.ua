import { Inject, ViewEncapsulation, ViewChild } from '@angular/core';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MatSnackBar } from '@angular/material';

import { DisplayMessage } from '../../shared/models/display-message';
import { PasswordValidation } from '../../shared/utils/password-validation';

import { HTTPStatusCodes } from '../../shared/lib/http-status-codes'

import {
  UserService,
  AuthService,
  SubscriptionService
} from '../../service';
import { QrScannerComponent } from 'angular2-qrscanner';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RegisterComponent implements OnInit, OnDestroy {

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

  registrationMethod = 'Generic';

  invSubCards: any[];
  invSubCardsRetrieving = false;

  regMethods = [
    {value: 'Generic'},
    {value: 'QR Code Invitation'}
  ];

  @ViewChild ('qrScanner') qrScanner: QrScannerComponent;

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

  qrDecodedOutput(decodedResult:string) {
    try {
      this.invSubCardsRetrieving = true;
      let invitation = JSON.parse(decodedResult);
      console.log(invitation);
      this.subscriptionService.getSubscriptionCards(invitation.subId)
      .delay(500)
      .subscribe(invSubCards => {
        this.invSubCards = invSubCards;
        this.invSubCardsRetrieving = false;
      },
      error => {
        this.notification = { msgType: 'error', msgBody: error.json().message };
      });

      this.qrDecoded = true;
    } catch (e) {
      this.snackBar.open("Error happened while QR code scanning", 'Registration', {
        panelClass: ['errorSnackBar'],
        duration: 3000,
        verticalPosition: 'top'
      }).afterDismissed().subscribe(()=>{
        this.qrScanner.startScanning();
      });
    }
  }

  onSubmit() {
    this.notification = undefined;
    this.submitted = true;

    this.authService.register(this.form.value)
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
      this.notification = { msgType: 'error', msgBody: error.json().message };
    });
  }

}
