import { Component, OnInit, ViewChild } from '@angular/core';
import { Course, CourseItem } from '../../model/index';
import { MatTableDataSource, MatExpansionPanel } from '@angular/material';
import { Router } from '@angular/router';
import { CourseService } from '../../service/index';

@Component({
  selector: 'app-course-management',
  templateUrl: './course-management.component.html',
  styleUrls: ['./course-management.component.css']
})
export class CourseManagementComponent implements OnInit {

  @ViewChild('coursesListPanel') coursesListPanel: MatExpansionPanel;

  coursesAll: Course[] = [];
  coursesItems: CourseItem[] = [];
  coursesNum: number = 0;

  coursesDisplayedColumns = ['id', 'name', 'eClassesNum'];
  coursesItemsDS: MatTableDataSource<CourseItem> = new MatTableDataSource<CourseItem>([]);

  constructor(
    private router: Router,
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

    this.coursesItems = [];
    for (let course of this.coursesAll) {
      let courseItem: CourseItem = <CourseItem> course;
      courseItem.checked = false;
      courseItem.eClassesNum = (courseItem.eClasses) ? courseItem.eClasses.length : 0;
      this.coursesItems.push(courseItem);
    }

    this.coursesItemsDS = new MatTableDataSource<CourseItem>(this.coursesItems);
  }

  onNewCourseAddedEvent(course: Course){
    this.coursesAll.push(course);
    this.refreshDS();
    this.coursesListPanel.open();
  }

  courseRowClicked(selectedCourse) {
    this.router.navigate(['course-edit', selectedCourse.id]);
  }

}
