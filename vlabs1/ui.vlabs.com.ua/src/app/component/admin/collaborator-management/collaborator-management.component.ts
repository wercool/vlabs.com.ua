import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DisplayMessage } from '../../../shared/models/display-message';
import { MatTableDataSource, MatExpansionPanel, MatSnackBar, MatDialog } from '@angular/material';
import { ClipboardService } from 'ng2-clipboard/ng2-clipboard';
import { environment } from '../../../../environments/environment';
import { Collaborator } from '../../../model/index';
import { CollaboratorService } from '../../../service/index';
import { EditUserDialogComponent } from '../user-management/edit-user-dialog/edit-user-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-collaborator-management',
  templateUrl: './collaborator-management.component.html',
  styleUrls: ['./collaborator-management.component.css']
})
export class CollaboratorManagementComponent implements OnInit {

  host = environment.host;

  @ViewChild('collaboratorsListPanel') collaboratorsListPanel: MatExpansionPanel;

  completed: boolean = false;

  collaboratorsAll: Collaborator[] = [];
  collaboratorsNum: number = 0;

  collaboratorsDisplayedColumns = ['id', 'alias', 'username', 'projects'];
  collaboratorsDS: MatTableDataSource<Collaborator> = new MatTableDataSource<Collaborator>();

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private clipboard: ClipboardService,
    private collaboratorService: CollaboratorService,
    private editUserDialog: MatDialog
  ) { }

  ngOnInit() {
    this.getAllCollaborators();
  }

  private getAllCollaborators():void {
    this.completed = false;
    this.collaboratorService.getAll()
    .subscribe(result => {
      // console.log(result);
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
    this.completed = true;
  }

  onNewCollaboratorAddedEvent(collaborator: Collaborator){
    this.completed = false;
    this.collaboratorsAll.push(collaborator);
    this.refreshDS();
    this.collaboratorsListPanel.open();
  }

  getInvitationLink(collaborator: Collaborator) {
    let invitationLink = this.host + '/register/collaborator/' + collaborator.id;
    this.clipboard.copy(invitationLink);
    this.snackBar.open(invitationLink, 'COPIED', {
      panelClass: ['successSnackBar'],
      duration: 1000,
      verticalPosition: 'top'
    });
  }

  openUserEditDialog(collaborator: Collaborator) {
    // console.log(collaborator);
    let dialogRef = this.editUserDialog.open(EditUserDialogComponent, {
      width: '80%',
      data: collaborator.user
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
    });
  }

  collaboratorRowClicked(collaborator: Collaborator) {
    // console.log(collaborator);
    this.router.navigate(['collaborator-edit', collaborator.id]);
  }
}
