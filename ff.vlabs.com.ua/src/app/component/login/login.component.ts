import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, NgForm } from '@angular/forms';
import { MatSnackBar, MatInput } from '@angular/material';
import { AuthService, UserService } from '../../service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  @ViewChild ('loginForm') loginForm: NgForm;

  form: FormGroup;

  submitted = false;
  userExists = undefined;
  passwordDoesNotMach = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userService: UserService
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
      this.passwordDoesNotMach = false;
      this.authService.login(this.form.value)
      .delay(500)
      .subscribe(data => {
        this.submitted = false;

        this.userService.getMyInfo().subscribe(
          user => {
            this.router.navigate(['/dashboard']);
          },
          error => {

          });

      },
      error => {
        this.passwordDoesNotMach = true;
        this.submitted = false;
      });
    }
  }

}
