import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-manager-sidenav',
  templateUrl: './manager-sidenav.component.html',
  styleUrls: ['./manager-sidenav.component.css']
})
export class ManagerSidenavComponent implements OnInit {

  @Output() navigateEvent: EventEmitter<string> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  navigate(url:string){
    this.navigateEvent.emit(url);
  }
}
