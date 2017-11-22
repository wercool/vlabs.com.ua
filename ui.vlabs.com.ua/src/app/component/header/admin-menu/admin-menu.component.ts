import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-admin-menu',
  templateUrl: './admin-menu.component.html',
  styleUrls: ['./admin-menu.component.css']
})
export class AdminMenuComponent implements OnInit{

  @Output() navigateEvent: EventEmitter<string> = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
  }

  navigate(url:string){
    this.navigateEvent.emit(url);
  }
}
