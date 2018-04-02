import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';

import { HTTPStatusCodes } from '../shared/lib/http-status-codes'

import { 
  Collaborator
} from '../model/index';

@Injectable()
export class CollaboratorService {

  constructor(
    private apiService: ApiService,
    private config: ConfigService
    ) { }

  addNew(collaborator: Collaborator) {
    return this.apiService.post(this.config.collaborator_add_url, collaborator);
  }
  getAll() {
    return this.apiService.get(this.config.collaborators_url);
  }
}
