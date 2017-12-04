import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DisplayMessage } from '../../../../shared/models/display-message';
import { Department } from '../../../../model/index';
import { DepartmentService } from '../../../../service/index';

@Component({
  selector: 'app-new-department',
  templateUrl: './new-department.component.html',
  styleUrls: ['./new-department.component.css']
})
export class NewDepartmentComponent implements OnInit {

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

  @Output() newDepartmentAddedEvent: EventEmitter<Department> = new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private departmentService: DepartmentService
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      title: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
    });
  }

  onSubmit(){
    this.submitted = true;

    this.departmentService.addNew(this.form.value)
    // show the animation
    .delay(1000)
    .subscribe(department => {
      this.submitted = false;
      this.form.reset();
      this.notification = { msgType: 'styles-success', msgBody: '<b>' + department.title + '</b>' + ' successfully added' };
      setTimeout(()=>{ this.notification = undefined; }, 5000);
      this.newDepartmentAddedEvent.emit(department);
    },
    error => {
      this.submitted = false;
      this.notification = { msgType: 'styles-error', msgBody: error.json().message };
    });
  }

}
