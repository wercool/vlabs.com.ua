import { Component, OnInit, ViewChild } from '@angular/core';
import { VLabWebSocketManagerService } from 'src/app/service/vlab.websocket.manager.service';
import { VLabComponent } from '../vlab/vlab.component';
import { MatSnackBar } from '@angular/material';
import { ManagedResponse, ManagedResponseStatus } from 'src/app/model/managed.response';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.css']
})
export class WorkspaceComponent implements OnInit {

    @ViewChild('vLabComponent') vLabComponent: VLabComponent;

    constructor(
        private vLabWebSocketManagerService: VLabWebSocketManagerService,
        private snackBar: MatSnackBar
    ) {
    }

    ngOnInit() {

    }

    onAddVLabWebSocketURLMapping() {
        this.vLabWebSocketManagerService.addRemoveMapping('vlab.base', 'add')
        .then((result: ManagedResponse) => {
            if (result.status == ManagedResponseStatus[ManagedResponseStatus.OK]) {
                this.snackBar.open(result.message, result.status.toString(), {
                    duration: 2000,
                });
            }
        })
        .catch(error => {});
    }

    onRemoveVLabWebSocketURLMapping() {
        this.vLabWebSocketManagerService.addRemoveMapping('vlab.base', 'remove')
        .then((result: ManagedResponse) => {
            if (result.status == ManagedResponseStatus[ManagedResponseStatus.OK]) {
                this.snackBar.open(result.message, result.status.toString(), {
                    duration: 2000,
                });
            }
        })
        .catch(error => {});
    }

    onVLabWebSocketConnect() {
        this.vLabComponent.sendVLabMessage({ type: 'connectWS', suffix: '/vlab.base' });
    }

    onVLabWebSocketSend() {
        this.vLabComponent.sendVLabMessage({ type: 'sendWS', message: this.makeid() });
    }

    makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      
        for (var i = 0; i < 5; i++)
          text += possible.charAt(Math.floor(Math.random() * possible.length));
      
        return text;
      }

}