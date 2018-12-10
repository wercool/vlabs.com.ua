import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeResourceUrl } from '@angular/platform-browser/src/security/dom_sanitization_service';
import { Router, ActivatedRoute } from '@angular/router';

import { environment } from '../../../environments/environment';
import { HelpClipService } from '../../service';
import { HelpClip } from '../../model';

@Component({
  selector: 'app-helpclip',
  templateUrl: './helpclip.component.html',
  styleUrls: ['./helpclip.component.css']
})
export class HelpClipComponent implements OnInit {

  private routeSub:any;

  @ViewChild('helpClipIFrame') private helpClipIFrame : ElementRef; 

  helpClip: HelpClip;
  helpClipReadyToStart: boolean = false;
  vLabEmbedSafeURL: SafeResourceUrl;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private helpClipService: HelpClipService
  ) { }

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      this.helpClipService.getByAlis(params['alias'])
      .subscribe(helpClip => {
        this.helpClip = helpClip;
        this.prepareVLabSafeURL(this.helpClip);
      },
      error => {
      });
    });
  }

  prepareVLabSafeURL(helpclip: HelpClip) {
      if (!helpclip.id) {
        return;
      }
      // this.vLabEmbedSafeURL = this.sanitizer.bypassSecurityTrustResourceUrl(environment.vlabsHost + '/' + helpclip.alias + '/index.html');
      this.vLabEmbedSafeURL = this.sanitizer.bypassSecurityTrustResourceUrl(helpclip.path);
      this.helpClipReadyToStart = true;
  }

  canDeactivate() {
    if(confirm("Please confirm you want to exit HelpClip")) {
      return true;
    } else {
      return false;
    }
  }
}
