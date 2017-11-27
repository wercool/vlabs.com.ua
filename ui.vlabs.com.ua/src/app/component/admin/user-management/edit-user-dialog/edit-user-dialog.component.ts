import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { User } from '../../../../model/index';
import { UserService } from '../../../../service/index';

@Component({
  selector: 'app-edit-user-dialog',
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.css']
})
export class EditUserDialogComponent implements OnInit {

    /**
   * Boolean used in telling the UI
   * that the form has been submitted
   * and is awaiting a response
   */
  submitted = false;

  constructor(
    public dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public user: User,
    private userService: UserService
  ) { }

  ngOnInit() {
  }

  resetPasswordAction() {
    this.submitted = true;
    this.userService.resetPassword(this.user.id)
    //animation
    .delay(750)
    .subscribe(result => {
      this.submitted = false;
    },
    error => {
      this.submitted = false;
    });
  }
}
