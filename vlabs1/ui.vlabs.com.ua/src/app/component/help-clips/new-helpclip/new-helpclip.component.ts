import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';


import { environment } from '../../../../environments/environment';
import { DisplayMessage } from '../../../shared/models/display-message';
import { HelpClip } from '../../../model/index';
import { HelpClipService } from '../../../service';

@Component({
  selector: 'app-new-helpclip',
  templateUrl: './new-helpclip.component.html',
  styleUrls: ['./new-helpclip.component.css']
})
export class NewHelpClipComponent implements OnInit {

  host = environment.host;

  form: FormGroup;

  newHelpClip:HelpClip = new HelpClip();

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

  @Output() newHelpClipAddedEvent: EventEmitter<HelpClip> = new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private helpClipService: HelpClipService
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      title: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
      alias: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(1024)])],
      path: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(2048)])],
      shortdesc: ['', Validators.compose([Validators.maxLength(1024)])],
      description: ['', Validators.compose([Validators.maxLength(2048)])],
    });
  }

  onSubmit(){
    this.submitted = true;

    this.helpClipService.addNew(this.form.value)
    // show the animation
    .delay(1000)
    .subscribe(helpClip => {
      this.submitted = false;
      this.form.reset();
      this.notification = { msgType: 'styles-success', msgBody: '<b>' + helpClip.title + '</b>' + ' successfully added' };
      setTimeout(()=>{ this.notification = undefined; }, 5000);
      this.newHelpClipAddedEvent.emit(helpClip);
    },
    error => {
      this.submitted = false;
      this.notification = { msgType: 'styles-error', msgBody: error.message };
    });
  }

  aliasInputChanged(alias: String) {
    this.newHelpClip.path = this.host + '/vlabs/' + this.newHelpClip.alias + '/index.html';
  }
}
