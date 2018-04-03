import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar,
  MatTableDataSource } from '@angular/material';
import { Course, EClass, EClassItem } from '../../../../model';
import { CourseService } from '../../../../service';

@Component({
  selector: 'add-course-eclass-dialog',
  templateUrl: './add-course-eclass-dialog.component.html',
  styleUrls: ['./add-course-eclass-dialog.component.css']
})
export class AddCourseEClassDialogComponent implements OnInit {

  completed = false;
  submitted = false;
  enabled = false;

  nonCourseEClasses: EClass[] = [];
  nonCourseEClassesItems: EClassItem[] = [];

  potentialCourseEClassesDisplayedColumns = ['id', 'name'];
  potentialCourseEClassesDS: MatTableDataSource<EClassItem> = new MatTableDataSource<EClassItem>([]);

  constructor(
    public dialogRef: MatDialogRef<AddCourseEClassDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public course: Course,
    private courseService: CourseService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    console.log("Selected Course:", this.course);

    this.courseService.getNonCourseEClasses(this.course.id)
    .delay(250)
    .subscribe(nonCourseEClasses => {
      this.nonCourseEClasses = nonCourseEClasses;
      this.completed = true;
      console.log(this.nonCourseEClasses);
      for (let nonCourseEClass of this.nonCourseEClasses) {
        let nonCourseEClassItem: EClassItem = <EClassItem> nonCourseEClass;
        nonCourseEClassItem.checked = false;
        this.nonCourseEClassesItems.push(nonCourseEClassItem);
      }
      this.potentialCourseEClassesDS = new MatTableDataSource<EClassItem>(this.nonCourseEClassesItems);
    },
    error => {
      this.snackBar.open(error.message, 'SERVER ERROR', {
        panelClass: ['errorSnackBar'],
        duration: 1000,
        verticalPosition: 'top'
      });
    });
  }

  checkSelected() {
    this.enabled = false;
    for (let nonCourseEClassItem of this.nonCourseEClassesItems) {
      if (nonCourseEClassItem.checked) {
        this.enabled = true;
      }
    }
  }

  addCourseEClass() {
    let newCourseEClasses:EClass[] = [];
    for (let nonCourseEClassItem of this.nonCourseEClassesItems) {
      if (nonCourseEClassItem.checked) {
        let nonCourseEClass:EClass = new EClass().map(nonCourseEClassItem);
        newCourseEClasses.push(nonCourseEClass);
      }
    }
    // console.log(newCourseEClasses);

    this.submitted = true;
    this.courseService.addCourseEClasses(this.course.id, newCourseEClasses)
    .delay(250)
    .subscribe(course => {
      this.dialogRef.close(course);
    },
    error => {
      this.snackBar.open(error.message, 'SERVER ERROR', {
        panelClass: ['errorSnackBar'],
        duration: 1000,
        verticalPosition: 'top'
      });
    });
  }

}
