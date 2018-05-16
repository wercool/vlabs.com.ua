import { Component, OnInit } from '@angular/core';
import { HelpClipService, ToolbarLabelService } from '../../../service';
import { HelpClip, HelpClipItem } from '../../../model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-helpclips-market',
  templateUrl: './helpclips-market.component.html',
  styleUrls: ['./helpclips-market.component.css']
})
export class HelpClipsMarketComponent implements OnInit {

  completed = false;
  helpClips: HelpClipItem[] = [];

  constructor(
    private router: Router,
    private toolbarLabelService: ToolbarLabelService,
    private helpClipsService: HelpClipService
  ) { }

  ngOnInit() {
    this.toolbarLabelService.setLabel('HelpClips Market');
    this.getAllHelpClips();
  }

  private getAllHelpClips():void {
    this.helpClips = [];
    this.helpClipsService.getAll()
    .delay(250)
    .subscribe(result => {
      for (let helpClip of result) {
        let helpClipItem: HelpClipItem = <HelpClipItem> helpClip;
        helpClipItem.iconPath = helpClipItem.path.replace('index.html', 'resources/icon.png');
        helpClipItem.thumbnailPath = helpClipItem.path.replace('index.html', 'resources/thumbnail.jpg');
        this.helpClips.push(helpClipItem);
      }
      this.helpClips = result;
      this.completed = true;
    },
    error => {
      this.completed = true;
    });
  }

  subscribe(helpClipId: number) {
    console.log('helpClipId', helpClipId);
  }
}
