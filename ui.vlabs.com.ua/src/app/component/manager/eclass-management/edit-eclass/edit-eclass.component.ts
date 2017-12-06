import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { EclassManagementComponent } from '../../../index';
import { ActivatedRoute, Router } from '@angular/router';
import { EClass } from '../../../../model/index';
import { EClassService } from '../../../../service/index';
import { MatSnackBar } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-eclass',
  templateUrl: './edit-eclass.component.html',
  styleUrls: ['./edit-eclass.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class EditEclassComponent implements OnInit {

  private sub: any;
  private eClass: EClass;

  generalEClassFormGroup: FormGroup;
  eclassSummary: string = '';
  froalaEditorOptions = {
    heightMin: 200,
    quickInsertTags: [],
    emoticonsUseImage: false
  };
  
  /**
   * Boolean used in telling the UI
   * that the form has been submitted
   * and is awaiting a response
   */
  submitted = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private eclassService: EClassService
  ) { }

  ngOnInit() {

    this.generalEClassFormGroup = this.formBuilder.group({
      title: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
      description: [''],
      active: [false],
    });

    this.sub = this.route.params.subscribe(params => {
      this.setEClass(params['id']);
    });
  }

  setEClass(id: number){
    if (Number(id).toString() === 'NaN'){
      setTimeout(() => {
        this.snackBar.open('Wrong URL parameter', 'ERROR', {
          panelClass: ['errorSnackBar'],
          duration: 1000,
          verticalPosition: 'top'
        });
        this.router.navigate(['eclass-management']);
      });
    } else {
      console.log(Number(id));
    }
  }

  onGeneralEClassFormSubmit(){
    this.submitted = true;

    // let newEclass: EClass = this.form.value;
    // newEclass.summary = this.eclassSummary;

    // this.eclassService.addNew(newEclass)
    // // show the animation
    // .delay(1000)
    // .subscribe(eclass => {
    //   this.submitted = false;
    //   this.form.reset();
    //   this.notification = { msgType: 'styles-success', msgBody: '<b>' + eclass.title + '</b>' + ' successfully added' };
    //   setTimeout(()=>{ this.notification = undefined; }, 5000);
    //   this.newEClassAddedEvent.emit(eclass);
    // },
    // error => {
    //   this.submitted = false;
    //   this.notification = { msgType: 'styles-error', msgBody: error.json().message };
    // });
  }

}
