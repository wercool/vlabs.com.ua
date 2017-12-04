import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';

import { HTTPStatusCodes } from '../shared/lib/http-status-codes'

import { 
  Faculty
} from '../model/index';

@Injectable()
export class FacultyService {

  constructor(
    private apiService: ApiService,
    private config: ConfigService
    ) { }

  addNew(faculty: Faculty) {
    return this.apiService.post(this.config.faculty_add_url, faculty);
  }
  getAll() {
    return this.apiService.get(this.config.faculties_url);
  }
}
