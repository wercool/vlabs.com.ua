import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Collaborator, User } from '../../../model';
import { CollaboratorService, UserService } from '../../../service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-collaborator-sidenav',
  templateUrl: './collaborator-sidenav.component.html',
  styleUrls: ['./collaborator-sidenav.component.css']
})
export class CollaboratorSidenavComponent implements OnInit {

  private collaborator: Collaborator;

  @Output() navigateEvent: EventEmitter<string> = new EventEmitter();

  completed = false;

  constructor(
    private userService: UserService,
    private collaboratorService: CollaboratorService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    const user: User = this.userService.currentUser;
    this.collaboratorService.getByUserId(user.id)
    .delay(250)
    .subscribe(collaborator => {
      this.setCollaborator(collaborator);
      this.completed = true;
      // console.log(this.collaborator);
    },
    error => {
      if (this.snackBar["opened"]) return;
      this.snackBar.open(error.message, 'SERVER ERROR', {
        panelClass: ['errorSnackBar'],
        duration: 1000,
        verticalPosition: 'top'
      });
    });
  }

  setCollaborator(collaborator: Collaborator) {
    this.collaborator = collaborator;
    this.collaboratorService.currentCollaborator = collaborator;
  }

  navigate(url:string){
    this.navigateEvent.emit(url);
  }

  navigateProjectActivityManagement(projectId: number) {
    this.navigate('collaborator/project-activity-management/' + projectId.toString());
  }
}
