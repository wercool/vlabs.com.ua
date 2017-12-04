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

  addNew(group: Group) {
    return this.apiService.post(this.config.group_add_url, group);
  }
  getAll() {
    return this.apiService.get(this.config.groups_url);
  }
}
