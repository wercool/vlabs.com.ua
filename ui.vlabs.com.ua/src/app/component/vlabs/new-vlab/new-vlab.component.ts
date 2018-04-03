import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';


import { environment } from '../../../../environments/environment';
import { VlabService } from '../../../service/index';
import { DisplayMessage } from '../../../shared/models/display-message';
import { Vlab } from '../../../model/index';

@Component({
  selector: 'app-new-vlab',
  templateUrl: './new-vlab.component.html',
  styleUrls: ['./new-vlab.component.css']
})
export class NewVlabComponent implements OnInit {

  host = environment.host;

  form: FormGroup;

  newVLab:Vlab = new Vlab();

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

  @Output() newVlabAddedEvent: EventEmitter<Vlab> = new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private vlabService: VlabService
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      title: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
      alias: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(64)])],
      path: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(1024)])],
    });
  }

  onSubmit(){
    this.submitted = true;

    this.vlabService.addNew(this.form.value)
    // show the animation
    .delay(1000)
    .subscribe(vlab => {
      this.submitted = false;
      this.form.reset();
      this.notification = { msgType: 'styles-success', msgBody: '<b>' + vlab.title + '</b>' + ' successfully added' };
      setTimeout(()=>{ this.notification = undefined; }, 5000);
      this.newVlabAddedEvent.emit(vlab);
    },
    error => {
      this.submitted = false;
      this.notification = { msgType: 'styles-error', msgBody: error.message };
    });
  }

  aliasInputChanged(alias: String) {
    this.newVLab.path = this.host + '/vlabs/' + this.newVLab.alias + '/index.html';
  }
}
