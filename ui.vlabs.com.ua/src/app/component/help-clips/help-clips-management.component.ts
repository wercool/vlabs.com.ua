import { Component, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { HelpClip } from '../../model';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-helpclips-management',
  templateUrl: './help-clips-management.component.html',
  styleUrls: ['./help-clips-management.component.css']
})
export class HelpClipsManagementComponent implements OnInit {

    helpClipsAll: HelpClip[] = [];

    helpClipsDisplayedColumns = ['id', 'title', 'alias', 'path'];
    helpClipsDS: MatTableDataSource<HelpClip>;
    helpclipsNum = 0;

    ngOnInit() {
    }

  onNewHelpClipAddedEvent(helpClip: HelpClip){
    // this.vlabsAll.push(vlab);
    // this.refreshDS();
    // this.vlabsListPanel.open();
  }

}