import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';

import { HTTPStatusCodes } from '../shared/lib/http-status-codes'

import { 
   HelpClip
} from '../model/index';

@Injectable()
export class HelpClipService {

  constructor(
    private apiService: ApiService,
    private config: ConfigService
    ) { }
  getById(id: number) {
    return this.apiService.get(this.config.helpclip_url + '/' + id);
  }
  addNew(helpClip: HelpClip) {
    return this.apiService.post(this.config.helpclip_add_url, helpClip);
  }
  update(helpClip: HelpClip) {
    return this.apiService.post(this.config.helpclip_update_url, helpClip);
  }
  getAll() {
    return this.apiService.get(this.config.helpclip_url);
  }
}
