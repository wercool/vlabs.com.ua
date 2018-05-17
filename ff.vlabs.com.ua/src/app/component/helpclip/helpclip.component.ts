import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeResourceUrl } from '@angular/platform-browser/src/security/dom_sanitization_service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-helpclip',
  templateUrl: './helpclip.component.html',
  styleUrls: ['./helpclip.component.css']
})
export class HelpClipComponent implements OnInit {

  private routeSub:any;

  vLabEmbedSafeURL: SafeResourceUrl;

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.prepareVLabSafeURL();
  }

  prepareVLabSafeURL() {
      this.vLabEmbedSafeURL = this.sanitizer.bypassSecurityTrustResourceUrl('http://192.168.0.100:9001/vlab.hvac.base/');
  }

  canDeactivate() {
    return false;
  }
}
