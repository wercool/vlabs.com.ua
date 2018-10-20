import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ToolbarLabelService, HelpClipService } from '../../service';
import { HelpClipItem } from '../../model';

@Component({
  selector: 'app-helpclips',
  templateUrl: './helpclips.component.html',
  styleUrls: ['./helpclips.component.css']
})
export class HelpClipsComponent implements OnInit {

  completed = false;

  @Input() onDashboard: boolean;

  subscribedHelpClips: HelpClipItem[] = [];

  constructor(
    private router: Router,
    private toolbarLabelService: ToolbarLabelService,
    private helpClipsService: HelpClipService
  ) { }

  ngOnInit() {
    if (!this.onDashboard) this.toolbarLabelService.setLabel('My HelpClips');
    this.getSubscribedHelpClips();
  }

  getSubscribedHelpClips() {
    this.subscribedHelpClips = [];
    this.helpClipsService.getSubscribed()
    .delay(250)
    .subscribe(result => {
      for (let helpClip of result) {
        let helpClipItem: HelpClipItem = <HelpClipItem> helpClip;
        helpClipItem.iconPath = helpClipItem.path.replace('index.html', 'resources/icon.png');
        helpClipItem.thumbnailPath = helpClipItem.path.replace('index.html', 'resources/thumbnail.jpg');
        this.subscribedHelpClips.push(helpClipItem);
      }
      this.completed = true;
    },
    error => {
      this.completed = true;
    });
  }

  launchHelpClip(helpClipAlias) {
    this.router.navigate(['/helpclip', helpClipAlias]);
  }
}
