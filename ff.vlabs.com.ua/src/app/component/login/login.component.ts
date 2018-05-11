import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { AuthService } from '../../service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  @ViewChild ('loginForm') loginForm: NgForm;
  submitted = false;

  userExists = undefined;

  constructor(
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      username: ['', Validators.compose([Validators.required, Validators.email])],
      password: ['']
    });
  }

  onSubmit() {
    if (!this.form.valid) return;
    this.submitted = true;

    if (this.userExists === undefined) {
      this.authService.userExists(this.form.value.username)
      .delay(500)
      .subscribe(data => {
        this.submitted = false;
        this.userExists = data.userExists;
        this.form.controls.password.validator = Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)]);
  
        if (!this.userExists) {
          this.snackBar.open('Password has been sent to ' + this.form.value.username, 'Password', {
            duration: 30000,
            verticalPosition: 'top'
          });
        }
      },
      error => {
        this.submitted = false;
      });
    } else {
      this.snackBar.dismiss();
      this.authService.login(this.form.value)
      .delay(500)
      .subscribe(data => {
        this.submitted = false;
        console.log(data);
      },
      error => {
        this.submitted = false;
      });
    }
  }

}
