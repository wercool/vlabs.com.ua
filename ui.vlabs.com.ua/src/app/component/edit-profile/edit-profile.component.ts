import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DisplayMessage } from '../../shared/models/display-message';
import { PasswordValidation } from '../../shared/utils/password-validation';
import { UserService } from '../../service/index';
import { User } from '../../model/index';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {

  form: FormGroup;

  userProfile: User;
  profilePhoto: any = null;

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
    private router: Router,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      firstName: [''],
      lastName: [''],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      phoneNumber: [''],
    });
    this.userProfile = this.userService.currentUser;
    this.getProfilePhoto();
  }

  getProfilePhoto(){
    this.userService.getProfilePhoto()
    .subscribe(pfofilePhoto => {
      this.profilePhoto = pfofilePhoto.imageData;
    },
    error => {
      this.notification = { msgType: 'error', msgBody: error.json().message };
    });
  }

  onSubmit() {
    this.notification = undefined;
    this.submitted = true;

    this.userService.updateProfile()
    // show the animation
    .delay(1000)
    .subscribe(user => {
      this.notification = { msgType: 'success', msgBody: 'updated successfully' };
      setTimeout(()=>{ this.notification = undefined; }, 1000);
      this.submitted = false;
      this.userService.currentUser = user;
    },
    error => {
      this.submitted = false;
      this.notification = { msgType: 'error', msgBody: error.json().message };
    });
  }

  onFileInput(event: EventTarget){
    let eventObj: MSInputMethodContext = <MSInputMethodContext> event;
    let target: HTMLInputElement = <HTMLInputElement> eventObj.target;
    let files: FileList = target.files;
    let formData = new FormData();
    let photoFile: File = files[0];
    formData.append('photoFile', photoFile, photoFile.name);
    // console.log(photoFile);

    this.notification = undefined;
    this.submitted = true;

    this.userService.updateProfilePhoto(formData)
    // show the animation
    .delay(1000)
    .subscribe(result => {
      this.submitted = false;
      this.getProfilePhoto();
    },
    error => {
      this.submitted = false;
      this.notification = { msgType: 'error', msgBody: error.json().message };
    });
  }

  onResetPassword(){
    this.router.navigate(['/reset-password']);
  }
}
