import { Component, OnInit } from '@angular/core';
import { HelpClipService, ToolbarLabelService, UserService } from '../../service';
import { HelpClip, HelpClipItem, HelpClipSubscription } from '../../model';
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
    private userService: UserService,
    private helpClipsService: HelpClipService
  ) { }

  ngOnInit() {
    this.toolbarLabelService.setLabel('HelpClips Market');
    this.getAllHelpClips();
  }

  private getAllHelpClips():void {
    this.helpClips = [];
    this.helpClipsService.getNotSubscribed()
    .delay(250)
    .subscribe(result => {
      for (let helpClip of result) {
        let helpClipItem: HelpClipItem = <HelpClipItem> helpClip;
        helpClipItem.iconPath = helpClipItem.path.replace('index.html', 'resources/icon.png');
        helpClipItem.thumbnailPath = helpClipItem.path.replace('index.html', 'resources/thumbnail.jpg');
        this.helpClips.push(helpClipItem);
      }
      this.completed = true;
    },
    error => {
      this.completed = true;
    });
  }

  subscribe(helpClipId: number) {
    // console.log('helpClipId', helpClipId);
    let helpClipSubscription: HelpClipSubscription = new HelpClipSubscription();
    helpClipSubscription.userId = this.userService.currentUser.id;
    helpClipSubscription.helpClipId = helpClipId;

    this.completed = false;

    this.helpClipsService.subscribe(helpClipSubscription)
    .delay(250)
    .subscribe(result => {
      this.completed = true;
      this.router.navigate(['/helpclips']);
    },
    error => {
      this.completed = true;
    });
  }
}
