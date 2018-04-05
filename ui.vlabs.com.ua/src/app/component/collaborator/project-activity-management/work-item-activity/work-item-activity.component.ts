import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DisplayMessage } from '../../../../shared/models/display-message';
import { CollaboratorProjectWorkItem, CollaboratorProject } from '../../../../model/index';
import { MatTableDataSource, MatExpansionPanel, MatSnackBar } from '@angular/material';

import { FileUploader } from 'ng2-file-upload';

import { CollaboratorService } from '../../../../service/index';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-collaborator-work-item-activity',
  templateUrl: './work-item-activity.component.html',
  styleUrls: ['./work-item-activity.component.css']
})
export class CollaboratorWorkItemActivityComponent implements OnInit {

    private sub: any;

    project: CollaboratorProject;
    workItem: CollaboratorProjectWorkItem;

    public uploader:FileUploader = new FileUploader({url: ''});
    public hasBaseDropZoneOver:boolean = false;

    completed = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private snackBar: MatSnackBar,
        private collaboratorService: CollaboratorService
    ) { }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            // console.log("Selected Work Item Id", params['id']);
            this.collaboratorService.getProjectWorkItem(params['id'])
            .delay(250)
            .subscribe(workItem => {
              this.setWorkItem(workItem);
              console.log(this.workItem);
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
        this.workItem = workItem;
        this.collaboratorService. getProject(this.workItem.project_id)
        .delay(250)
        .subscribe(project => {
          this.project = project;
          this.completed = true;
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

    public fileOverBase(e:any):void {
      this.hasBaseDropZoneOver = true;
    }

}
