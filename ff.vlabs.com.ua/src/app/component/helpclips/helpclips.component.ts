import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ToolbarLabelService } from '../../service';

@Component({
  selector: 'app-helpclips',
  templateUrl: './helpclips.component.html',
  styleUrls: ['./helpclips.component.css']
})
export class HelpClipsComponent implements OnInit {

  @Input() onDashboard: boolean;

  constructor(
    private router: Router,
    private toolbarLabelService: ToolbarLabelService,
  ) { }

  ngOnInit() {
    if (!this.onDashboard) this.toolbarLabelService.setLabel('My HelpClips');
  }

  launchHelpClip(helpClipAlias) {
    let self = this;
    setTimeout(function() {
        window.scrollTo(0, 0);
        setTimeout(function() {
          self.router.navigate(['/helpclip', helpClipAlias]);
        }, 100);
    }, 0);
  }
}
