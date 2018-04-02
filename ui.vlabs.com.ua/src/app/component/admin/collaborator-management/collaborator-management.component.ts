import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DisplayMessage } from '../../../shared/models/display-message';
import { Collaborator } from '../../../model/index';
import { MatTableDataSource, MatExpansionPanel } from '@angular/material';
import { CollaboratorService } from '../../../service/index';

@Component({
  selector: 'app-collaborator-management',
  templateUrl: './collaborator-management.component.html',
  styleUrls: ['./collaborator-management.component.css']
})
export class CollaboratorManagementComponent implements OnInit {

  @ViewChild('collaboratorsListPanel') collaboratorsListPanel: MatExpansionPanel;

  collaboratorsAll: Collaborator[] = [];
  collaboratorsNum: number = 0;

  collaboratorsDisplayedColumns = ['id', 'alias', 'username'];
  collaboratorsDS: MatTableDataSource<Collaborator> = new MatTableDataSource<Collaborator>();

  constructor(
    private collaboratorService: CollaboratorService
  ) { }

  ngOnInit() {
    this.getAllCollaborators();
  }

  private getAllCollaborators():void {
    this.collaboratorService.getAll()
    .subscribe(result => {
      this.upateDS(result);
    },
    error => {
    });
  }

  private upateDS(updatedDS: Collaborator[]){
    this.collaboratorsAll = updatedDS;
    this.refreshDS();
  }

  private refreshDS(){
    this.collaboratorsNum = this.collaboratorsAll.length;
    this.collaboratorsDS = new MatTableDataSource<Collaborator>(this.collaboratorsAll);
  }

  onNewCollaboratorAddedEvent(collaborator: Collaborator){
    this.collaboratorsAll.push(collaborator);
    this.refreshDS();
    this.collaboratorsListPanel.open();
  }

  getInvitationLink(collaborator: Collaborator) {
    window.prompt('Copy to clipboard: Ctrl+C, Enter', 'test');
  }
}
