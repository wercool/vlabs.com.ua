import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatSnackBar, MatDialog, MatTableDataSource, 
    MatDialogRef, MAT_DIALOG_DATA, 
    MatSort, MatPaginator, MatPaginatorIntl } from '@angular/material';
import { DisplayMessage } from '../../../shared/models/display-message';

import { ConfirmationDialog } from '../../dialogs/confirmation-dialog/confirmation-dialog.component';
import { Course, EClass, EClassItem } from '../../../model';
import { CourseService } from '../../../service';
import { AddCourseEClassDialogComponent } from './add-course-eclass-dialog/add-course-eclass-dialog.component';

@Component({
  selector: 'app-edit-course',
  templateUrl: './edit-course.component.html',
  styleUrls: ['./edit-course.component.css']
})
export class EditCourseComponent implements OnInit {

    private sub: any;
    private course: Course;

    generalCourseFormGroup: FormGroup;

    courseEClassesItems: EClassItem[] = [];

      /**
     * Notification message from received
     * form request or router
     */
    notification: DisplayMessage;

    courseEClassesDisplayedColumns = ['id', 'title'];
    courseEClassesDS: MatTableDataSource<EClassItem> = new MatTableDataSource<EClassItem>([]);

    submitted = false;
    completed = false;
    removeEClass = false;

 
    constructor(
      private route: ActivatedRoute,
      private router: Router,
      private snackBar: MatSnackBar,
      private formBuilder: FormBuilder,
      private courseService: CourseService,
      private addCourseEClassDialog: MatDialog,
      private confirmationDialog: MatDialog
    ) { }
  
    ngOnInit() {
        this.completed = false;
        this.generalCourseFormGroup = this.formBuilder.group({
            name: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
        });

        this.sub = this.route.params.subscribe(params => {
            this.courseService.getById(params['id'])
            .delay(250)
            .subscribe(course => {
              this.setCourse(course);
              this.completed = true;
              console.log(this.course);
            },
            error => {
              this.snackBar.open(error.message, 'SERVER ERROR', {
                panelClass: ['errorSnackBar'],
                duration: 1000,
                verticalPosition: 'top'
              });
            });
          });
    }

    setCourse(course: Course) {
        this.course = course;
        this.courseEClassesItems = [];
        for (let courseEClass of this.course.eClasses) {
          let courseEClassItem: EClassItem = <EClassItem> courseEClass;
          courseEClassItem.checked = false;
          this.courseEClassesItems.push(courseEClassItem);
        }
        this.courseEClassesDS = new MatTableDataSource<EClassItem>(this.courseEClassesItems);
        this.checkSelected();
    }

    onGeneralCourseFormGroupSubmit() {
        this.submitted = true;

        this.courseService.update(this.course)
        // show the animation
        .delay(250)
        .subscribe(course => {
            this.course =course;
            this.submitted = false;
            this.notification = { msgType: 'styles-success', msgBody: '<b>' + course.name + '</b>' + ' successfully updated' };
            setTimeout(() => { this.notification = undefined; }, 2000);
        },
        error => {
          this.submitted = false;
          this.snackBar.open(error.message, 'SERVER ERROR', {
            panelClass: ['errorSnackBar'],
            duration: 1000,
            verticalPosition: 'top'
          });
        });
    }

    checkSelected() {
        this.removeEClass = false;
        for (let courseEClassItem of this.courseEClassesItems) {
          if (courseEClassItem.checked) {
            this.removeEClass = true;
          }
        }
    }

    openAddEClassDialog() {
      let dialogRef = this.addCourseEClassDialog.open(AddCourseEClassDialogComponent, {
          width: '80%',
          data: this.course
        });
        dialogRef.afterClosed().subscribe(course => {
          if (course) {
            this.setCourse(course);
          }
        });
    }

    removeSelectedEClass() {
        let dialogRef = this.confirmationDialog.open(ConfirmationDialog, {
            width: '80%',
            data: "Confirm please Course EClasses deletion"
          });
          dialogRef.afterClosed().subscribe(confirmed => {
            if (confirmed) {
              let removeCourseEClasses:EClass[] = [];
              for (let courseEClassItem of this.courseEClassesItems) {
                if (courseEClassItem.checked) {
                  let removeCourseEClass:EClass = new EClass().map(courseEClassItem);
                  removeCourseEClasses.push(removeCourseEClass);
                }
              }
              // console.log(this.removeCourseEClasses);
          
              this.submitted = true;
              this.courseService.removeCourseEClasses(this.course.id, removeCourseEClasses)
              .delay(250)
              .subscribe(course => {
                this.setCourse(course);
                this.submitted = false;
              },
              error => {
                this.snackBar.open(error.message, 'SERVER ERROR', {
                  panelClass: ['errorSnackBar'],
                  duration: 1000,
                  verticalPosition: 'top'
                });
              });
            }
          });
    }

    courseEClassClicked(selectedEClass: EClass) {
        this.router.navigate(['eclass-edit', selectedEClass.id]);
    }

}