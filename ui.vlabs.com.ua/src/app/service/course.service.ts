import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';

import { HTTPStatusCodes } from '../shared/lib/http-status-codes'

import { 
  Course
} from '../model/index';

@Injectable()
export class CourseService {

  constructor(
    private apiService: ApiService,
    private config: ConfigService
    ) { }

  addNew(course: Course) {
    return this.apiService.post(this.config.course_add_url, course);
  }
  getAll() {
    return this.apiService.get(this.config.courses_url);
  }
}
