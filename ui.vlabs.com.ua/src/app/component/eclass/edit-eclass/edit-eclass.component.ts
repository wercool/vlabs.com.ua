import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { EclassManagementComponent } from '../../index';
import { ActivatedRoute, Router } from '@angular/router';
import { EClass, EClassFormat } from '../../../model/index';
import { EClassService } from '../../../service/index';
import { MatSnackBar } from '@angular/material';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DisplayMessage } from '../../../shared/models/display-message';

@Component({
  selector: 'app-edit-eclass',
  templateUrl: './edit-eclass.component.html',
  styleUrls: ['./edit-eclass.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class EditEclassComponent implements OnInit {

  private sub: any;
  private eClass: EClass;
  private eClassFormats: EClassFormat[];

  generalEClassFormGroup: FormGroup;
  eclassSummary: string = '';
  
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
      format_id:  ['', Validators.compose([Validators.required])]
    });

    this.eclassService.getFormats()
    .delay(250)
    .subscribe(eclassFormats => {
        this.eClassFormats = eclassFormats;

        this.sub = this.route.params.subscribe(params => {
          this.setEClass(params['id']);
        });
    },
    error => {
      this.snackBar.open(error.json().message, 'SERVER ERROR', {
        panelClass: ['errorSnackBar'],
        duration: 1000,
        verticalPosition: 'top'
      });
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
      .delay(250)
      .subscribe(eclass => {

        this.eClass = eclass;

        this.eclassService.getSummaryById(id)
        .delay(250)
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
    .delay(250)
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
