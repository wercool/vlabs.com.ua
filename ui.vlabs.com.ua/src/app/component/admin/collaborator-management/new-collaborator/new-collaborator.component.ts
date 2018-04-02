import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DisplayMessage } from '../../../../shared/models/display-message';
import { Collaborator } from '../../../../model/index';
import { CollaboratorService } from '../../../../service/index';

@Component({
  selector: 'app-new-collaborator',
  templateUrl: './new-collaborator.component.html',
  styleUrls: ['./new-collaborator.component.css']
})
export class NewCollaboratorComponent implements OnInit {


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

  @Output() newCollaboratorAddedEvent: EventEmitter<Collaborator> = new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private collaboratorService: CollaboratorService
  ) { }


  ngOnInit() {
    this.form = this.formBuilder.group({
      alias: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
    });
  }

  onSubmit(){
    this.submitted = true;

    this.collaboratorService.addNew(this.form.value)
    // show the animation
    .delay(1000)
    .subscribe(collaborator => {
      this.submitted = false;
      this.form.reset();
      this.notification = { msgType: 'styles-success', msgBody: '<b>' + collaborator.alias + '</b>' + ' successfully added' };
      setTimeout(()=>{ this.notification = undefined; }, 5000);
      this.newCollaboratorAddedEvent.emit(collaborator);
    },
    error => {
      this.submitted = false;
      this.notification = { msgType: 'styles-error', msgBody: error.json().message };
    });
  }

}
