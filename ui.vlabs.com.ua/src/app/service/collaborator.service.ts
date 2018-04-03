import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';

import { HTTPStatusCodes } from '../shared/lib/http-status-codes'

import { 
  Collaborator, CollaboratorProject, CollaboratorProjectWorkItem
} from '../model/index';

@Injectable()
export class CollaboratorService {

  public currentCollaborator:Collaborator = null;

  constructor(
    private apiService: ApiService,
    private config: ConfigService
    ) { }

  getById(id: number) {
    return this.apiService.get(this.config.collaborator_url + '/' + id);
  }
  getByUserId(userId: number) {
    return this.apiService.get(this.config.collaborator_by_user_id_url.replace("{userId}", userId.toString()));
  }
  addNew(collaborator: Collaborator) {
    return this.apiService.post(this.config.collaborator_add_url, collaborator);
  }
  update(collaborator: Collaborator) {
    return this.apiService.post(this.config.collaborator_update_url, collaborator);
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
  getNonCollaboratorProjects(collaboratorId: number) {
    return this.apiService.get(this.config.collaborator_non_collaborator_projects_url.replace("{collaboratorId}", collaboratorId.toString()));
  }
  addProjects(collaboratorId: number, newCollaboratorProjects: CollaboratorProject[]) {
    return this.apiService.post(this.config.collaborator_add_projects_url.replace("{collaboratorId}", collaboratorId.toString()), newCollaboratorProjects);
  }
  removeProjects(collaboratorId: number, removeCollaboratorProjects: CollaboratorProject[]) {
    return this.apiService.post(this.config.collaborator_remove_projects_url.replace("{collaboratorId}", collaboratorId.toString()), removeCollaboratorProjects);
  }
  getProject(collaboratorProjectId: number) {
    return this.apiService.get(this.config.collaborator_project_url.replace("{collaboratorProjectId}", collaboratorProjectId.toString()));
  }
  getProjectWorkItems(collaboratorId: number, collaboratorProjectId: number) {
    return this.apiService.get(this.config.collaborator_project_work_items_url
                               .replace("{collaboratorId}", collaboratorId.toString())
                               .replace("{collaboratorProjectId}", collaboratorProjectId.toString())
                              );
  }
  addNewProjectWorkItem(projectWorkItem: CollaboratorProjectWorkItem) {
    return this.apiService.post(this.config.collaborator_project_work_item_add_url, projectWorkItem);
  }
}
