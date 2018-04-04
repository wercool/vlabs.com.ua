import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DisplayMessage } from '../../../../../shared/models/display-message';
import { CollaboratorProject } from '../../../../../model/index';
import { CollaboratorService } from '../../../../../service/index';

@Component({
  selector: 'app-new-collaborator-project',
  templateUrl: './new-collaborator-project.component.html',
  styleUrls: ['./new-collaborator-project.component.css']
})
export class NewCollaboratorProjectComponent implements OnInit {


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

  @Output() newCollaboratorProjectAddedEvent: EventEmitter<CollaboratorProject> = new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private collaboratorService: CollaboratorService
  ) { }


  ngOnInit() {
    this.form = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
      alias: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
      description: ['']
    });
  }

  onSubmit(){
    this.submitted = true;
    this.notification = null;

    this.collaboratorService.addNewCollaboratorProject(this.form.value)
    // show the animation
    .delay(1000)
    .subscribe(collaboratorProject => {
      this.submitted = false;
      this.form.reset();
      this.notification = { msgType: 'styles-success', msgBody: '<b>' + collaboratorProject.name + '</b>' + ' successfully added' };
      setTimeout(()=>{ this.notification = undefined; }, 5000);
      this.newCollaboratorProjectAddedEvent.emit(collaboratorProject);
    },
    error => {
      this.submitted = false;
      let errorDetails = JSON.parse(error.headers.get('errorDetails'));
      if (errorDetails) {
        this.notification = { msgType: 'styles-error', msgBody: errorDetails.detailMessage };
      } else {
        this.notification = { msgType: 'styles-error', msgBody: error.message };
      }
    });
  }

}
