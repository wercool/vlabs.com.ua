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
import { HelpClip } from '../../../model';
import { HelpClipService } from '../../../service';

@Component({
  selector: 'app-edit-helpclip',
  templateUrl: './edit-helpclip.component.html',
  styleUrls: ['./edit-helpclip.component.css']
})
export class EditHelpClipComponent implements OnInit {

    private sub: any;
    private helpClip: HelpClip;

    helpClipsHost = environment.vlabsHost;

    generalHelpClipFormGroup: FormGroup;

    helpClipEmbedSafeURL: SafeResourceUrl;

    helpClipImplementationActivated:boolean = false;

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
      private helpClipService: HelpClipService,
      private sanitizer: DomSanitizer
    ) { }
  
    ngOnInit() {
        this.completed = false;
        this.generalHelpClipFormGroup = this.formBuilder.group({
            title: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
            alias: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
            path: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(1024)])],
            shortdesc: ['', Validators.compose([Validators.maxLength(1024)])],
            description: ['', Validators.compose([Validators.maxLength(2048)])],
        });

        this.sub = this.route.params.subscribe(params => {
            this.helpClipService.getById(params['id'])
            .delay(250)
            .subscribe(helpClip => {
              this.setHelpClip(helpClip);
              this.prepareHelpClipSafeURL();
              this.completed = true;
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

    setHelpClip(helpClip: HelpClip) {
        this.helpClip = helpClip;
    }

    aliasInputChanged(alias: String) {
      this.helpClip.path = this.helpClipsHost + '/' + this.helpClip.alias + '/index.html';
    }

    onGeneralHelpClipFormGroupSubmit() {
        this.submitted = true;

        this.helpClipService.update(this.helpClip)
        // show the animation
        .delay(250)
        .subscribe(helpClip => {
            this.helpClip = helpClip;
            this.submitted = false;
            this.notification = { msgType: 'styles-success', msgBody: '<b>' + helpClip.title + '</b>' + ' successfully updated' };
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

    prepareHelpClipSafeURL() {
        this.helpClipEmbedSafeURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.helpClip.path);
    }

    helpClipRepresentationPanelOpened(event) {
        this.prepareHelpClipSafeURL();
        this.helpClipImplementationActivated = true;
    }

}