import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { environment } from "src/environments/environment";

@Component({
  selector: 'app-vlab',
  templateUrl: './vlab.component.html',
  styleUrls: ['./vlab.component.css']
})
export class VLabComponent implements OnInit {

    @ViewChild('iframe') iframe: ElementRef;
    vLabURL: string;

    constructor(
        private authService: AuthService
    ) {

    }

    ngOnInit() {
        this.vLabURL = 'http://localhost:9001/vlab.base/?token=' + btoa(this.authService.token);
    }

    ngAfterViewInit() {
        this.iframe.nativeElement.loaded = this.onLoadVLab();
        window.addEventListener('message', this.onVLabMessage.bind(this), false);
    }

    onLoadVLab() {
        console.log('VLab loaded');
    }

    onVLabMessage(event: any) {
        console.log('VLab message: ', event.data);
    }

    sendVLabMessage(message: any) {
        this.iframe.nativeElement.contentWindow.postMessage({ message: message }, environment.VLabsHost);
    }
}