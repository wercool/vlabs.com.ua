import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DisplayMessage } from '../../../../shared/models/display-message';
import { Module } from '../../../../model/index';
import { ModuleService } from '../../../../service/index';

@Component({
  selector: 'app-new-module',
  templateUrl: './new-module.component.html',
  styleUrls: ['./new-module.component.css']
})
export class NewModuleComponent implements OnInit {

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

  @Output() newModuleAddedEvent: EventEmitter<Module> = new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private moduleService: ModuleService
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      title: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
    });
  }

  onSubmit(){
    this.submitted = true;

    this.moduleService.addNew(this.form.value)
    // show the animation
    .delay(1000)
    .subscribe(module => {
      this.submitted = false;
      this.form.reset();
      this.notification = { msgType: 'styles-success', msgBody: '<b>' + module.title + '</b>' + ' successfully added' };
      setTimeout(()=>{ this.notification = undefined; }, 5000);
      this.newModuleAddedEvent.emit(module);
    },
    error => {
      this.submitted = false;
      this.notification = { msgType: 'styles-error', msgBody: error.json().message };
    });
  }
}
