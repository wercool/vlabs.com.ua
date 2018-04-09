import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Collaborator, User } from '../../../model';
import { CollaboratorService, UserService } from '../../../service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-collaborator-manager-sidenav',
  templateUrl: './collaborator-manager-sidenav.component.html',
  styleUrls: ['./collaborator-manager-sidenav.component.css']
})
export class CollaboratorManagerSidenavComponent implements OnInit {

  @Output() navigateEvent: EventEmitter<string> = new EventEmitter();

  constructor(
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
  }

  navigate(url:string){
    this.navigateEvent.emit(url);
  }
}
