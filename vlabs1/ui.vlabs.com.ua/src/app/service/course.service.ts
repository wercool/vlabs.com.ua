import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';

import { HTTPStatusCodes } from '../shared/lib/http-status-codes'

import { 
  Course, EClass
} from '../model/index';

@Injectable()
export class CourseService {

  constructor(
    private apiService: ApiService,
    private config: ConfigService
    ) { }

  getById(id: number) {
    return this.apiService.get(this.config.course_url + '/' + id);
  }
  addNew(course: Course) {
    return this.apiService.post(this.config.course_add_url, course);
  }
  getAll() {
    return this.apiService.get(this.config.courses_url);
  }
  update(course: Course) {
    return this.apiService.post(this.config.course_update_url, course);
  }
  getCourseEClasses(courseId: number) {
    return this.apiService.get(this.config.course_eclasses_url.replace("{courseId}", courseId.toString()));
  }
  getNonCourseEClasses(courseId: number) {
    return this.apiService.get(this.config.course_non_course_eclasses_url.replace("{courseId}", courseId.toString()));
  }
  addCourseEClasses(courseId: number, newCourseEClasses: EClass[]) {
    return this.apiService.post(this.config.course_add_eclasses_url.replace("{courseId}", courseId.toString()), newCourseEClasses);
  }
  removeCourseEClasses(courseId: number, removeCourseEClasses: EClass[]) {
    return this.apiService.post(this.config.course_remove_eclasses_url.replace("{courseId}", courseId.toString()), removeCourseEClasses);
  }
}
