import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DisplayMessage } from '../../../../shared/models/display-message';
import { CollaboratorProject } from '../../../../model/index';
import { MatTableDataSource, MatExpansionPanel } from '@angular/material';
import { CollaboratorService } from '../../../../service/index';

@Component({
  selector: 'app-collaborator-project-management',
  templateUrl: './collaborator-project-management.component.html',
  styleUrls: ['./collaborator-project-management.component.css']
})
export class CollaboratorProjectManagementComponent implements OnInit {

  @ViewChild('collaboratorProjectsListPanel') collaboratorProjectsListPanel: MatExpansionPanel;

  collaboratorProjectsAll: CollaboratorProject[] = [];
  collaboratorProjectsNum: number = 0;

  collaboratorProjectsDisplayedColumns = ['id', 'name', 'alias'];
  collaboratorProjectsDS: MatTableDataSource<CollaboratorProject> = new MatTableDataSource<CollaboratorProject>();

  completed: boolean = false;

  constructor(
    private collaboratorService: CollaboratorService
  ) { }

  ngOnInit() {
    this.getAllCollaboratorProjects();
  }

  private getAllCollaboratorProjects():void {
    this.completed = false;
    this.collaboratorService.getAllCollaboratorProjects()
    .subscribe(result => {
      this.upateDS(result);
    },
    error => {
    });
  }

  private upateDS(updatedDS: CollaboratorProject[]){
    this.collaboratorProjectsAll = updatedDS;
    this.refreshDS();
  }

  private refreshDS(){
    this.collaboratorProjectsNum = this.collaboratorProjectsAll.length;
    this.collaboratorProjectsDS = new MatTableDataSource<CollaboratorProject>(this.collaboratorProjectsAll);
    this.completed = true;
  }

  onCollaboratorProjectsAddedEvent(collaboratorProject: CollaboratorProject){
    this.collaboratorProjectsAll.push(collaboratorProject);
    this.refreshDS();
    this.collaboratorProjectsListPanel.open();
  }

}
