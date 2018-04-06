import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DisplayMessage } from '../../../../shared/models/display-message';
import { CollaboratorProjectWorkItem, CollaboratorProject, VLabsFileItem, Collaborator } from '../../../../model/index';
import { MatTableDataSource, MatExpansionPanel, MatSnackBar } from '@angular/material';

import { FileUploader, ParsedResponseHeaders, FileItem } from 'ng2-file-upload';

import { CollaboratorService, ConfigService, AuthService } from '../../../../service/index';
import { ActivatedRoute, Router } from '@angular/router';
import { HTTPStatusCodes } from '../../../../shared/lib/http-status-codes';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-collaborator-work-item-activity',
  templateUrl: './work-item-activity.component.html',
  styleUrls: ['./work-item-activity.component.css']
})
export class CollaboratorWorkItemActivityComponent implements OnInit {

    private sub: any;

    host = environment.host;

    project: CollaboratorProject;
    workItem: CollaboratorProjectWorkItem;

    public uploader:FileUploader;
    public hasBaseDropZoneOver:boolean = false;

    workItemFileItemsDisplayedColumns = ['isDirectory', 'name', 'lastModified'];
    workItemFileItemsDS: MatTableDataSource<VLabsFileItem>;

    vLabPreviewEmbedSafeURL: SafeResourceUrl;
    blendSceneJSONFile = '';

    completed = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private snackBar: MatSnackBar,
        private sanitizer: DomSanitizer,
        private authService: AuthService,
        private collaboratorService: CollaboratorService,
        private configService: ConfigService
    ) {
    }
    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            // console.log("Selected Work Item Id", params['id']);
            this.collaboratorService.getProjectWorkItem(params['id'])
            .delay(250)
            .subscribe(workItem => {
              this.setWorkItem(workItem);
              // console.log(this.workItem);
            },
            error => {
              this.snackBar.open(error.message, 'SERVER ERROR', {
                panelClass: ['errorSnackBar'],
                duration: 1000,
                verticalPosition: 'top'
              });
            });
        });
    }

    setWorkItem(workItem: CollaboratorProjectWorkItem) {
        this.uploader = new FileUploader({
          url: this.configService.collaborator_project_work_item_upload_url.replace('{collaboratorProjectWorkItemId}', workItem.id.toString()),
          queueLimit: (workItem.type == 'resource') ? undefined : 1,
          allowedMimeType: (workItem.type == 'resource') ? undefined : ['application/zip'],
        })
        this.uploader.onCompleteAll = this.uploadComplete.bind(this);;
        this.uploader.onCompleteItem = this.uploadItemComplete.bind(this);;
        this.uploader.onErrorItem = this.uploadItemError.bind(this);

        this.workItem = workItem;

        this.workItemFileItemsDS = new MatTableDataSource<VLabsFileItem>(this.workItem.fileItems);
        // console.log(this.workItemFileItemsDS);

        for (let fileItem of this.workItem.fileItems) {
          if (fileItem.name.indexOf('.blend') > -1) {
            this.blendSceneJSONFile = fileItem.name.replace('.blend', '.json');
          }
        }

        this.collaboratorService. getProject(this.workItem.project_id)
        .delay(250)
        .subscribe(project => {
          this.project = project;
          this.completed = true;
          this.setPreviewURL();
        //   console.log(this.project);
        },
        error => {
          this.snackBar.open(error.message, 'SERVER ERROR', {
            panelClass: ['errorSnackBar'],
            duration: 1000,
            verticalPosition: 'top'
          });
        });
    }

    setPreviewURL() {
        //this.host
        if (this.blendSceneJSONFile) {
          let vLabPreviewParam = this.project.alias + "/" + this.collaboratorService.currentCollaborator.alias + "/" + this.workItem.alias + "/result/" + this.blendSceneJSONFile;
          this.vLabPreviewEmbedSafeURL = this.sanitizer.bypassSecurityTrustResourceUrl("http://localhost:9001/vlab.preview/?path=" + vLabPreviewParam);
        }
    }

    public fileOverBase(e:any):void {
      this.hasBaseDropZoneOver = true;
    }

    uploadItemError(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders) {
      try{
        this.snackBar.open(JSON.parse(response).errorCause, item.file.name, {
          panelClass: ['errorSnackBar'],
          duration: 5000,
          verticalPosition: 'top'
        });
      } catch (ex) {
        this.snackBar.open(response, item.file.name, {
          panelClass: ['errorSnackBar'],
          duration: 5000,
          verticalPosition: 'top'
        });
      }
      if (status == HTTPStatusCodes.FORBIDDEN) {
        this.authService.logout().subscribe(res => {
          this.router.navigate(['/login']);
        });
      }
      this.uploader.cancelAll();
      this.ngOnInit();
    }

    uploadItemComplete(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders) {

    }

    uploadComplete() {
      this.ngOnInit();
    }
}
