import { Component, OnInit, Input } from '@angular/core';
import { CElement, CElementItem } from '../../../../model/index';
import { CElementService } from '../../../../service/index';
import { MatSnackBar, MatDialog, MatExpansionPanel } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

import { EditPropertyDialogComponent } from "../../../dialogs/edit-property-dialog/edit-property-dialog.component";
import { YoutubeItem } from "../../../../shared/models/celement/youtube-item";
import { SafeResourceUrl } from '@angular/platform-browser/src/security/dom_sanitization_service';
import { ViewChild } from '@angular/core/src/metadata/di';

@Component({
  selector: 'celement-item-youtube',
  templateUrl: './celement-youtube.component.html',
  styleUrls: ['./celement-youtube.component.css']
})
export class CelementYoutubeComponent implements OnInit{

  @Input() cElement: CElement;

  cElementItemsCompleted = false;

  cElementItems: CElementItem[];

  youTubeItem: YoutubeItem = new YoutubeItem();
  youtubeEmbedSafeURL: SafeResourceUrl;

  activateYouTubeIframe = false;

  constructor(
    private snackBar: MatSnackBar,
    private cElementService: CElementService,
    private editPropertyDialog: MatDialog,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    this.cElementService.getCElementItemsByCElementId(this.cElement.id)
    .delay(250)
    .subscribe(cElementItems => {
      this.cElementItems = cElementItems;
      if (this.cElementItems.length == 0) {
        let cElementItem: CElementItem = new CElementItem();
        this.cElementItems.push(cElementItem);
      } else {
        if (this.cElementItems[0].nature !== undefined) {
          this.youTubeItem = JSON.parse(this.cElementItems[0].nature);
          this.prepareYouTubeSafeURL();
        }
      }

      this.cElementItemsCompleted = true;
    },
    error => {
      this.snackBar.open(error.message, 'SERVER ERROR', {
        panelClass: ['errorSnackBar'],
        duration: 1000,
        verticalPosition: 'top'
      });
    });
  }

  itemsPanelHeaderClicked(event, expPanel:MatExpansionPanel) {
    this.activateYouTubeIframe = expPanel.expanded;
  }

  editYoutubeVideoURL() {
    let dialogRef = this.editPropertyDialog.open(EditPropertyDialogComponent, {
      width: '80%',
      data: { type: 'text-input', value: this.youTubeItem.videoURL, caption: 'YouTube Video URL' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cElementItems[0].celementId = this.cElement.id;
        this.cElementItems[0].sid = 1;
        this.youTubeItem.videoURL = result.value;
        this.youTubeItem.videoId = this.youTubeItem.videoURL.split('=')[1];
        this.cElementItems[0].nature = JSON.stringify(this.youTubeItem);

        this.cElementItemsCompleted = false;

        this.cElementService.updateCElementItem(this.cElementItems[0])
        .delay(250)
        .subscribe(cElementItem => {
          this.cElementItems[0] = cElementItem;
          if (this.cElementItems[0].nature !== undefined) {
            this.youTubeItem = JSON.parse(this.cElementItems[0].nature);
            this.prepareYouTubeSafeURL();
          }
          this.cElementItemsCompleted = true;
        },
        error => {
          this.cElementItemsCompleted = false;
          this.snackBar.open(error.message, 'SERVER ERROR', {
            panelClass: ['errorSnackBar'],
            duration: 1000,
            verticalPosition: 'top'
          });
        });
      }
    });
  }

  editYoutubeItemComments() {
    let dialogRef = this.editPropertyDialog.open(EditPropertyDialogComponent, {
      width: '80%',
      data: { type: 'text-rich', value: this.youTubeItem.comments, caption: 'YouTube Video Comments' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cElementItems[0].celementId = this.cElement.id;
        this.cElementItems[0].sid = 1;
        this.youTubeItem.comments = result.value;
        this.cElementItems[0].nature = JSON.stringify(this.youTubeItem);

        this.cElementItemsCompleted = false;

        this.cElementService.updateCElementItem(this.cElementItems[0])
        .delay(250)
        .subscribe(cElementItem => {
          this.cElementItems[0] = cElementItem;
          if (this.cElementItems[0].nature !== undefined) {
            this.youTubeItem = JSON.parse(this.cElementItems[0].nature);
          }
          this.cElementItemsCompleted = true;
        },
        error => {
          this.cElementItemsCompleted = false;
          this.snackBar.open(error.message, 'SERVER ERROR', {
            panelClass: ['errorSnackBar'],
            duration: 1000,
            verticalPosition: 'top'
          });
        });
      }
    });
  }

  prepareYouTubeSafeURL() {
    if (this.youTubeItem.videoId != undefined)
      this.youtubeEmbedSafeURL = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + this.youTubeItem.videoId);
  }
}
