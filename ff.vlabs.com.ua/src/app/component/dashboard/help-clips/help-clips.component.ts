import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-help-clips',
  templateUrl: './help-clips.component.html',
  styleUrls: ['./help-clips.component.css']
})
export class HelpClipsComponent implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }

  launchHelpClip(helpClipAlias) {
    this.router.navigate(['/help-clip', helpClipAlias]);
  }
}
