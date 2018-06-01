import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { ApiService } from './api.service';

import { HTTPStatusCodes } from '../shared/lib/http-status-codes'

import { 
   HelpClip, HelpClipSubscription
} from '../model/index';

@Injectable()
export class HelpClipService {

  constructor(
    private apiService: ApiService
    ) { }
  getById(id: number) {
    return this.apiService.get(this.apiService.helpclipURL + '/' + id);
  }
  getByAlis(alias: string) {
    return this.apiService.get(this.apiService.helpclipByAliasURL.replace('{alias_Base64Encoded}', btoa(alias)));
  }
  getAll() {
    return this.apiService.get(this.apiService.helpclipsURL);
  }
  subscribe(helpClipSubscription) {
    return this.apiService.post(this.apiService.helpclipSubscribeURL, helpClipSubscription);
  }
  getNotSubscribed() {
    return this.apiService.get(this.apiService.helpclipsNotSubscribedURL);
  }
  getSubscribed() {
    return this.apiService.get(this.apiService.helpclipsSubscribedURL);
  }
}
