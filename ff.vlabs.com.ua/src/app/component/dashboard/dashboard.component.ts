import { Component, OnInit } from '@angular/core';
import { AuthService, UserService } from '../../service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  currentTabLabel = 'My HelpClips';

  constructor(
    private router: Router,
    private authService: AuthService,
    public userService: UserService
  ) { }

  ngOnInit() {
  }

  tabSelectionChanged(event){
    let selectedTab = event.tab;
    this.currentTabLabel = selectedTab.textLabel;
  }
}
