import { Component, OnInit } from '@angular/core';
import { DisplayMessage } from '../../shared/models/display-message';
import { UserService, AuthService } from '../../service/index';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PasswordValidation } from '../../shared/utils/password-validation';
import { ApiService } from '../../service/api.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

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

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      oldPassword: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
      newPassword: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
      confirmNewPassword: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
    }, {
      validator: PasswordValidation.MatchNewPassword // password validation method
    });
  }

  onSubmit() {
    this.notification = undefined;
    this.submitted = true;

    this.authService.changePassowrd(this.form.value)
    // show the animation
    .delay(1000)
    .subscribe(response => {
      if (response.result == "error")
      {
        this.notification = { msgType: 'error', msgBody: 'current password is incorrect' };
        setTimeout(()=>{ this.notification = undefined; }, 4000);
      }
      else{
        this.notification = { msgType: 'success', msgBody: 'password successfully reset' };
        setTimeout(()=>{ this.notification = undefined; }, 1000);
      }
      this.submitted = false;
    },
    error => {
      this.submitted = false;
      this.notification = { msgType: 'error', msgBody: error.message };
    });
  }
}
