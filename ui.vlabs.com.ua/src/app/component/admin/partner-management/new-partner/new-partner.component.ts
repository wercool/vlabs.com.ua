import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DisplayMessage } from '../../../../shared/models/display-message';
import { Partner } from '../../../../model/index';
import { PartnerService } from '../../../../service/index';

@Component({
  selector: 'app-new-partner',
  templateUrl: './new-partner.component.html',
  styleUrls: ['./new-partner.component.css']
})
export class NewPartnerComponent implements OnInit {


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

  @Output() newPartnerAddedEvent: EventEmitter<Partner> = new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private partnerService: PartnerService
  ) { }


  ngOnInit() {
    this.form = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
    });
  }

  onSubmit(){
    this.submitted = true;

    this.partnerService.addNew(this.form.value)
    // show the animation
    .delay(1000)
    .subscribe(partner => {
      this.submitted = false;
      this.form.reset();
      this.notification = { msgType: 'styles-success', msgBody: '<b>' + partner.name + '</b>' + ' successfully added' };
      setTimeout(()=>{ this.notification = undefined; }, 5000);
      this.newPartnerAddedEvent.emit(partner);
    },
    error => {
      this.submitted = false;
      this.notification = { msgType: 'styles-error', msgBody: error.message };
    });
  }

}
