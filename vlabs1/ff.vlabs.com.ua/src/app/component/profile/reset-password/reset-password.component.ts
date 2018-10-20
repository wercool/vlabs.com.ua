import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PasswordValidation } from '../../../shared/util/password-validation';
import { DisplayMessage } from '../../../shared/model/display-message';
import { UserService, AuthService } from '../../../service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

    form: FormGroup;

    submitted = false;

    notification: DisplayMessage;

    constructor(
        private authService: AuthService,
        private userService: UserService,
        private formBuilder: FormBuilder
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
    .delay(1000)
    .subscribe(response => {
      if (response.result == "error")
      {
        this.notification = { msgType: 'error', msgBody: 'current password is incorrect' };
      }
      else{
        this.notification = { msgType: 'success', msgBody: 'password successfully reset' };
        setTimeout(()=>{ this.notification = undefined; }, 4000);
      }
      this.submitted = false;
    },
    error => {
      this.submitted = false;
      this.notification = { msgType: 'error', msgBody: error.message };
    });
  }

}