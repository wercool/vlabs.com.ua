import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';

import { HTTPStatusCodes } from '../shared/lib/http-status-codes'

import { 
  Group
} from '../model/index';

@Injectable()
export class GroupService {

  constructor(
    private apiService: ApiService,
    private config: ConfigService
    ) { }

  getById(id: number) {
    return this.apiService.get(this.config.group_url + '/' + id);
  }
  addNew(group: Group) {
    return this.apiService.post(this.config.group_add_url, group);
  }
  getAll() {
    return this.apiService.get(this.config.groups_url);
  }
  update(group: Group) {
    return this.apiService.post(this.config.group_update_url, group);
  }
}
