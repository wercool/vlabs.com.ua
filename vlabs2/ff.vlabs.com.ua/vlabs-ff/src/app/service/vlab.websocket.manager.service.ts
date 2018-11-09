import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable()
export class VLabWebSocketManagerService {

  constructor(
    private apiService: ApiService,
  ) { }

  addRemoveMapping(suffix: string, action: string) {
      let apiEndPoint = this.apiService.APIEndpoints.getFullyQualifiedURL('vlab_websocket_manager', action + '_mapping', [suffix]);
      return new Promise((resolve, reject) => {
        this.apiService
        .get(apiEndPoint)
        .delay(100)
        .toPromise()
        .then(result => {
            resolve(result);
        })
        .catch((error) => {
            reject(error);
        });
      });
  }
}
