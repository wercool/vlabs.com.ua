import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';

import { HTTPStatusCodes } from '../shared/lib/http-status-codes'

import { 
  Group,
  User
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
  getMemebers(groupId: number) {
    return this.apiService.get(this.config.group_members_url.replace("{groupId}", groupId.toString()));
  }
  getNonMemebers(groupId: number) {
    return this.apiService.get(this.config.group_non_members_url.replace("{groupId}", groupId.toString()));
  }
  addGroupMembers(groupId: number, newGroupMembers: User[]) {
    return this.apiService.post(this.config.group_add_members_url.replace("{groupId}", groupId.toString()), newGroupMembers);
  }
  removeGroupMembers(groupId: number, removeGroupMembers: User[]) {
    return this.apiService.post(this.config.group_remove_members_url.replace("{groupId}", groupId.toString()), removeGroupMembers);
  }
}
