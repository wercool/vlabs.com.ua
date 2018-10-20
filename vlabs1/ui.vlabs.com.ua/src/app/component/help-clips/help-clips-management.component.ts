import { Component, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { HelpClip } from '../../model';
import { MatTableDataSource, MatExpansionPanel } from '@angular/material';
import { HelpClipService } from '../../service';

@Component({
  selector: 'app-helpclips-management',
  templateUrl: './help-clips-management.component.html',
  styleUrls: ['./help-clips-management.component.css']
})
export class HelpClipsManagementComponent implements OnInit {

  @ViewChild('helpClipsListPanel') helpClipsListPanel: MatExpansionPanel;

  helpClipsAll: HelpClip[] = [];

  helpClipsDisplayedColumns = ['id', 'title', 'alias', 'path'];
  helpClipsDS: MatTableDataSource<HelpClip>;
  helpclipsNum = 0;

  constructor(
    private router: Router,
    private helpClipService: HelpClipService
  ) {}

  ngOnInit() {
    this.getAllHelpClips();
  }

  private getAllHelpClips():void {
    this.helpClipService.getAll()
    .subscribe(result => {
      this.upateDS(result);
    },
    error => {
    });
  }

  private upateDS(updatedDS: HelpClip[]){
    this.helpClipsAll = updatedDS;
    this.refreshDS();
  }

  private refreshDS(){
    this.helpclipsNum = this.helpClipsAll.length;
    this.helpClipsDS = new MatTableDataSource<HelpClip>(this.helpClipsAll);
  }

  onNewHelpClipAddedEvent(helpClip: HelpClip){
    this.helpClipsAll.push(helpClip);
    this.refreshDS();
    this.helpClipsListPanel.open();
  }

  helpClipRowClicked(selectedHelpClip: HelpClip) {
    this.router.navigate(['helpclip-edit', selectedHelpClip.id]);
  }

}