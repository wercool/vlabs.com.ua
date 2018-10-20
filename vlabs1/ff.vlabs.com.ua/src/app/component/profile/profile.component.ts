import { Component, OnInit } from '@angular/core';
import { ToolbarLabelService, UserService } from '../../service';
import { User } from '../../model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  form: FormGroup;

  submitted = false;
  userProfile: User;

  constructor(
    private router: Router,
    private toolbarLabelService: ToolbarLabelService,
    private userService: UserService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.toolbarLabelService.setLabel('Profile');
    this.form = this.formBuilder.group({
      firstName: [''],
      lastName: [''],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      phoneNumber: [''],
    });
    this.userProfile = this.userService.currentUser;
  }

  onSubmit() {
      this.submitted = true;
      this.userService.updateProfile()
      .delay(500)
      .subscribe(user => {
        this.submitted = false;
        this.userService.currentUser = user;
        this.userProfile = this.userService.currentUser;
      },
      error => {
        this.submitted = false;
      });
  }

  onResetPassword(){
    this.router.navigate(['/reset-password']);
  }
}
