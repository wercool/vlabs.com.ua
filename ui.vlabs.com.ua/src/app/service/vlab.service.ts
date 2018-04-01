import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';

import { HTTPStatusCodes } from '../shared/lib/http-status-codes'

import { 
  Vlab
} from '../model/index';

@Injectable()
export class VlabService {

  constructor(
    private apiService: ApiService,
    private config: ConfigService
    ) { }
  getById(id: number) {
    return this.apiService.get(this.config.vlab_url + '/' + id);
  }
  addNew(vlab: Vlab) {
    return this.apiService.post(this.config.vlab_add_url, vlab);
  }
  update(vlab: Vlab) {
    return this.apiService.post(this.config.vlabs_update_url, vlab);
  }
  getAll() {
    return this.apiService.get(this.config.vlabs_url);
  }
}
