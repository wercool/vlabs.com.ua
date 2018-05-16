import { Component, OnInit } from '@angular/core';
import { ToolbarLabelService } from '../../service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor(
    private toolbarLabelService: ToolbarLabelService,
  ) { }

  ngOnInit() {
    this.toolbarLabelService.setLabel('Profile');
  }

}
