import { Component, OnInit, ViewChild } from '@angular/core';
import { Course } from '../../../model/index';
import { MatTableDataSource, MatExpansionPanel } from '@angular/material';
import { CourseService } from '../../../service/index';

@Component({
  selector: 'app-course-management',
  templateUrl: './course-management.component.html',
  styleUrls: ['./course-management.component.css']
})
export class CourseManagementComponent implements OnInit {

  @ViewChild('coursesListPanel') coursesListPanel: MatExpansionPanel;

  coursesAll: Course[] = [];
  coursesNum: number = 0;

  coursesDisplayedColumns = ['id', 'name'];
  coursesDS: MatTableDataSource<Course>;

  constructor(
    private courseService: CourseService
  ) { }

  ngOnInit() {
    this.getAllCourses();
  }

  private getAllCourses():void {
    this.courseService.getAll()
    .subscribe(result => {
      this.upateDS(result);
    },
    error => {
    });
  }

  private upateDS(updatedDS: Course[]){
    this.coursesAll = updatedDS;
    this.refreshDS();
  }

  private refreshDS(){
    this.coursesNum = this.coursesAll.length;
    this.coursesDS = new MatTableDataSource<Course>(this.coursesAll);
  }

  onNewCourseAddedEvent(course: Course){
    this.coursesAll.push(course);
    this.refreshDS();
    this.coursesListPanel.open();
  }

}
