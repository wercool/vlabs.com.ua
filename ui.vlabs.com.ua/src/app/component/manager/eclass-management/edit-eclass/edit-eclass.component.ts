import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { EclassManagementComponent } from '../../../index';
import { ActivatedRoute, Router } from '@angular/router';
import { EClass } from '../../../../model/index';
import { EClassService } from '../../../../service/index';
import { MatSnackBar } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DisplayMessage } from '../../../../shared/models/display-message';

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
  
  submitted = false;
  completed = false;

    /**
   * Notification message from received
   * form request or router
   */
  notification: DisplayMessage;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private eclassService: EClassService
  ) { }

  ngOnInit() {

    this.completed = false;

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
      this.eclassService.getById(id)
      .delay(1000)
      .subscribe(eclass => {
        this.eClass = eclass;
      },
      error => {
        this.snackBar.open(error.json().message, 'SERVER ERROR', {
          panelClass: ['errorSnackBar'],
          duration: 1000,
          verticalPosition: 'top'
        });
      });

      this.eclassService.getSummaryById(id)
      .delay(1000)
      .subscribe(result => {
          this.eclassSummary = result.data;
          this.completed = true;
      },
      error => {
        this.snackBar.open(error.json().message, 'SERVER ERROR', {
          panelClass: ['errorSnackBar'],
          duration: 1000,
          verticalPosition: 'top'
        });
      });
    }
  }

  onGeneralEClassFormSubmit(){
    this.submitted = true;

    this.eclassService.update(this.eClass)
    // show the animation
    .delay(1000)
    .subscribe(eclass => {

      this.eclassService.updateSummary(eclass.id, this.eclassSummary).subscribe(result => {
        this.submitted = false;
        this.notification = { msgType: 'styles-success', msgBody: '<b>' + eclass.title + '</b>' + ' successfully updated' };
        setTimeout(()=>{ this.notification = undefined; }, 2000);
      },
        error => {
          this.submitted = false;
          this.snackBar.open(error.json().message, 'SERVER ERROR', {
            panelClass: ['errorSnackBar'],
            duration: 1000,
            verticalPosition: 'top'
        });
      });

    },
    error => {
      this.submitted = false;
      this.snackBar.open(error.json().message, 'SERVER ERROR', {
        panelClass: ['errorSnackBar'],
        duration: 1000,
        verticalPosition: 'top'
      });
    });
  }

}
