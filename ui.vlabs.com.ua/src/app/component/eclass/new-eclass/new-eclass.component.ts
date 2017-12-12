import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DisplayMessage } from '../../../shared/models/display-message';
import { EClass, EClassFormat } from '../../../model/index';
import { EClassService } from '../../../service/index';
import { ViewChild } from '@angular/core/src/metadata/di';

@Component({
  selector: 'app-new-eclass',
  templateUrl: './new-eclass.component.html',
  styleUrls: ['./new-eclass.component.css']
})
export class NewEclassComponent implements OnInit {

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

  @Output() newEClassAddedEvent: EventEmitter<EClass> = new EventEmitter();

  eclassSummary: string = '';;

  private eClassFormats: EClassFormat[];

  constructor(
    private formBuilder: FormBuilder,
    private eclassService: EClassService
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      title: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
      description: [''],
      active: [false],
      format_id:  ['', Validators.compose([Validators.required])]
    });
    this.getEClassFormats();
  }

  private getEClassFormats():void {
    this.eclassService.getFormats()
    .subscribe(eclassFormats => {
        this.eClassFormats = eclassFormats;
    });
  }

  onSubmit(){
    this.submitted = true;

    let newEclass: EClass = this.form.value;
    this.eclassService.addNew(newEclass)
    // show the animation
    .delay(1000)
    .subscribe(eclass => {
      if (this.eclassSummary) {
        this.eclassService.updateSummary(eclass.id, this.eclassSummary).subscribe(result => {
          this.submitted = false;
          this.form.reset();
          this.notification = { msgType: 'styles-success', msgBody: '<b>' + eclass.title + '</b>' + ' successfully added' };
          setTimeout(()=>{ this.notification = undefined; }, 5000);
          this.newEClassAddedEvent.emit(eclass);
        },
        error => {
          this.submitted = false;
          this.notification = { msgType: 'styles-error', msgBody: error.json().message };
        });
      } else {
        this.submitted = false;
        this.form.reset();
        this.notification = { msgType: 'styles-success', msgBody: '<b>' + eclass.title + '</b>' + ' successfully added' };
        setTimeout(()=>{ this.notification = undefined; }, 5000);
        this.newEClassAddedEvent.emit(eclass);
      }
    },
    error => {
      this.submitted = false;
      this.notification = { msgType: 'styles-error', msgBody: error.json().message };
    });
  }

}
