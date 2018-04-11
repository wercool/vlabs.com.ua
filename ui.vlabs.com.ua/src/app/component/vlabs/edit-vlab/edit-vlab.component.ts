import { Component, OnInit, Input } from '@angular/core';
import {Location} from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatSnackBar, MatDialog, MatTableDataSource, 
    MatDialogRef, MAT_DIALOG_DATA, 
    MatSort, MatPaginator, MatPaginatorIntl } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeResourceUrl } from '@angular/platform-browser/src/security/dom_sanitization_service';
import { DisplayMessage } from '../../../shared/models/display-message';

import { environment } from '../../../../environments/environment';
import { Vlab } from '../../../model';
import { VlabService } from '../../../service';

@Component({
  selector: 'app-edit-vlab',
  templateUrl: './edit-vlab.component.html',
  styleUrls: ['./edit-vlab.component.css']
})
export class EditVLabComponent implements OnInit {

    private sub: any;
    private vlab: Vlab;

    vlabsHost = environment.vlabsHost;

    generalVlabFormGroup: FormGroup;

    vLabEmbedSafeURL: SafeResourceUrl;

    vlabImplementationActivated:boolean = false;

      /**
     * Notification message from received
     * form request or router
     */
    notification: DisplayMessage;

    submitted = false;
    completed = false;
 
    constructor(
      private route: ActivatedRoute,
      private router: Router,
      private location: Location,
      private snackBar: MatSnackBar,
      private formBuilder: FormBuilder,
      private vlabService: VlabService,
      private sanitizer: DomSanitizer
    ) { }
  
    ngOnInit() {
        this.completed = false;
        this.generalVlabFormGroup = this.formBuilder.group({
            title: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
            alias: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
            path: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(1024)])],
        });

        this.sub = this.route.params.subscribe(params => {
            this.vlabService.getById(params['id'])
            .delay(250)
            .subscribe(vlab => {
              this.setVLab(vlab);
              this.prepareVLabSafeURL();
              this.completed = true;
              console.log(this.vlab);
            },
            error => {
              let errorDetails = JSON.parse(error.headers.get('errorDetails'));
              this.snackBar.open(errorDetails.detailMessage, 'SERVER ERROR', {
                panelClass: ['errorSnackBar'],
                duration: 1000,
                verticalPosition: 'top'
              });
              console.log(error);
              this.location.back();
            });
          });
    }

    setVLab(vlab: Vlab) {
        this.vlab = vlab;
    }

    aliasInputChanged(alias: String) {
      this.vlab.path = this.vlabsHost + '/' + this.vlab.alias + '/index.html';
    }

    onGeneralVlabFormGroupSubmit() {
        this.submitted = true;

        this.vlabService.update(this.vlab)
        // show the animation
        .delay(250)
        .subscribe(vlab => {
            this.vlab =vlab;
            this.submitted = false;
            this.notification = { msgType: 'styles-success', msgBody: '<b>' + vlab.title + '</b>' + ' successfully updated' };
            setTimeout(() => { this.notification = undefined; }, 2000);
        },
        error => {
          this.submitted = false;
          if (this.snackBar["opened"]) return;
          this.snackBar.open(error.message, 'SERVER ERROR', {
            panelClass: ['errorSnackBar'],
            duration: 1000,
            verticalPosition: 'top'
          });
        });
    }

    prepareVLabSafeURL() {
        this.vLabEmbedSafeURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.vlab.path);
    }

    vlabRepresentationPanelOpened(event) {
        this.prepareVLabSafeURL();
        this.vlabImplementationActivated = true;
    }

}