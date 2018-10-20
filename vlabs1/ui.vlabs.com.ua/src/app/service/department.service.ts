import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';

import { HTTPStatusCodes } from '../shared/lib/http-status-codes'

import { 
  Department
} from '../model/index';

@Injectable()
export class DepartmentService {

  constructor(
    private apiService: ApiService,
    private config: ConfigService
    ) { }

  addNew(department: Department) {
    return this.apiService.post(this.config.department_add_url, department);
  }
  getAll() {
    return this.apiService.get(this.config.departments_url);
  }
}
