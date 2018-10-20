import { Component, OnInit } from '@angular/core';
import { AuthService, UserService, ToolbarLabelService } from '../../service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  private sub: any;

  constructor(
    public router: Router,
    private toolbarLabelService: ToolbarLabelService,
  ) {}

  ngOnInit() {
    this.toolbarLabelService.setLabel('Dashboard');
  }
}
