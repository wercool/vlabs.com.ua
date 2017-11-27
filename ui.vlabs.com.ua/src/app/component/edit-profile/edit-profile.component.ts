import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DisplayMessage } from '../../shared/models/display-message';
import { PasswordValidation } from '../../shared/utils/password-validation';
import { UserService } from '../../service/index';
import { User } from '../../model/index';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {

  form: FormGroup;

  userProfile: User;

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
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      firstName: [''],
      lastName: [''],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      phoneNumber: [''],
    });
    this.userProfile = this.userService.currentUser;
  }

  onSubmit() {
    this.notification = undefined;
    this.submitted = true;

    this.userService.updateProfile()
    // show the animation
    .delay(1000)
    .subscribe(data => {
      this.notification = { msgType: 'success', msgBody: 'updated successfully' };
      this.submitted = false;
    },
    error => {
      this.submitted = false;
      this.notification = { msgType: 'error', msgBody: error.json().message };
    });
  }
}
