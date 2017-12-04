import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DisplayMessage } from '../../../../shared/models/display-message';
import { CourseService } from '../../../../service/index';
import { Course } from '../../../../model/index';

@Component({
  selector: 'app-new-course',
  templateUrl: './new-course.component.html',
  styleUrls: ['./new-course.component.css']
})
export class NewCourseComponent implements OnInit {

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

  @Output() newCourseAddedEvent: EventEmitter<Course> = new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private courseService: CourseService
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
    });
  }

  onSubmit(){
    this.submitted = true;

    this.courseService.addNew(this.form.value)
    // show the animation
    .delay(1000)
    .subscribe(course => {
      this.submitted = false;
      this.form.reset();
      this.notification = { msgType: 'styles-success', msgBody: '<b>' + course.name + '</b>' + ' successfully added' };
      setTimeout(()=>{ this.notification = undefined; }, 5000);
      this.newCourseAddedEvent.emit(course);
    },
    error => {
      this.submitted = false;
      this.notification = { msgType: 'styles-error', msgBody: error.json().message };
    });
  }
}
