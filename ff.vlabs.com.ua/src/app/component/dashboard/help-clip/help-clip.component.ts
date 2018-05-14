import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeResourceUrl } from '@angular/platform-browser/src/security/dom_sanitization_service';

@Component({
  selector: 'app-help-clip',
  templateUrl: './help-clip.component.html',
  styleUrls: ['./help-clip.component.css']
})
export class HelpClipComponent implements OnInit {

  vLabEmbedSafeURL: SafeResourceUrl;

  constructor(
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.prepareVLabSafeURL();
  }

  prepareVLabSafeURL() {
      this.vLabEmbedSafeURL = this.sanitizer.bypassSecurityTrustResourceUrl('http://192.168.101.106:9001/vlab.hvac.base/');
  }
}
