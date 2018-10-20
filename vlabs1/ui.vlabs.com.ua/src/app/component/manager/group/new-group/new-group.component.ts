import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DisplayMessage } from '../../../../shared/models/display-message';
import { Group } from '../../../../model/index';
import { GroupService } from '../../../../service/index';

@Component({
  selector: 'app-new-group',
  templateUrl: './new-group.component.html',
  styleUrls: ['./new-group.component.css']
})
export class NewGroupComponent implements OnInit {
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
  
    @Output() newGroupAddedEvent: EventEmitter<Group> = new EventEmitter();
  
    constructor(
      private formBuilder: FormBuilder,
      private groupService: GroupService
    ) { }
  
    ngOnInit() {
      this.form = this.formBuilder.group({
        name: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
      });
    }
  
    onSubmit(){
      this.submitted = true;
  
      this.groupService.addNew(this.form.value)
      // show the animation
      .delay(1000)
      .subscribe(group => {
        this.submitted = false;
        this.form.reset();
        this.notification = { msgType: 'styles-success', msgBody: '<b>' + group.name + '</b>' + ' successfully added' };
        setTimeout(()=>{ this.notification = undefined; }, 5000);
        this.newGroupAddedEvent.emit(group);
      },
      error => {
        this.submitted = false;
        this.notification = { msgType: 'styles-error', msgBody: error.message };
      });
    }

}
