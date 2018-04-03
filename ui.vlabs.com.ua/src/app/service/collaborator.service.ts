import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';

import { HTTPStatusCodes } from '../shared/lib/http-status-codes'

import { 
  Collaborator, CollaboratorProject
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
  getAllCollaboratorProjects() {
    return this.apiService.get(this.config.collaborators_projects_url);
  }
  addNewCollaboratorProject(collaboratorProject: CollaboratorProject) {
    return this.apiService.post(this.config.collaborators_project_add_url, collaboratorProject);
  }
}
