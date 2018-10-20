import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';

import { HTTPStatusCodes } from '../shared/lib/http-status-codes'

import { 
  Faculty, Group
} from '../model/index';

@Injectable()
export class FacultyService {

  constructor(
    private apiService: ApiService,
    private config: ConfigService
    ) { }

  getById(id: number) {
    return this.apiService.get(this.config.faculty_url + '/' + id);
  }
  addNew(faculty: Faculty) {
    return this.apiService.post(this.config.faculty_add_url, faculty);
  }
  getAll() {
    return this.apiService.get(this.config.faculties_url);
  }
  update(faculty: Faculty) {
    return this.apiService.post(this.config.faculty_update_url, faculty);
  }
  getFacultyGroups(facultyId: number) {
    return this.apiService.get(this.config.faculty_groups_url.replace("{facultyId}", facultyId.toString()));
  }
  getNonFacultyGroups(facultyId: number) {
    return this.apiService.get(this.config.faculty_non_faculty_groups_url.replace("{facultyId}", facultyId.toString()));
  }
  addFacultyGroups(facultyId: number, newFacultyGroups: Group[]) {
    return this.apiService.post(this.config.faculty_add_groups_url.replace("{facultyId}", facultyId.toString()), newFacultyGroups);
  }
  removeFacultyGroups(facultyId: number, removeFacultyGroups: Group[]) {
    return this.apiService.post(this.config.faculty_remove_groups_url.replace("{facultyId}", facultyId.toString()), removeFacultyGroups);
  }
}
