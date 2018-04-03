import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DisplayMessage } from '../../../../shared/models/display-message';
import { Faculty } from '../../../../model/index';
import { FacultyService } from '../../../../service/index';

@Component({
  selector: 'app-new-faculty',
  templateUrl: './new-faculty.component.html',
  styleUrls: ['./new-faculty.component.css']
})
export class NewFacultyComponent implements OnInit {

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

  @Output() newFacultyAddedEvent: EventEmitter<Faculty> = new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private facultyService: FacultyService
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      title: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
    });
  }

  onSubmit(){
    this.submitted = true;

    this.facultyService.addNew(this.form.value)
    // show the animation
    .delay(1000)
    .subscribe(faculty => {
      this.submitted = false;
      this.form.reset();
      this.notification = { msgType: 'styles-success', msgBody: '<b>' + faculty.title + '</b>' + ' successfully added' };
      setTimeout(()=>{ this.notification = undefined; }, 5000);
      this.newFacultyAddedEvent.emit(faculty);
    },
    error => {
      this.submitted = false;
      this.notification = { msgType: 'styles-error', msgBody: error.message };
    });
  }

}
