import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatSnackBar, MatDialog, MatTableDataSource, 
    MatDialogRef, MAT_DIALOG_DATA, 
    MatSort, MatPaginator, MatPaginatorIntl } from '@angular/material';
import { DisplayMessage } from '../../../../shared/models/display-message';

import { ConfirmationDialog } from '../../../dialogs/confirmation-dialog/confirmation-dialog.component';
import { Faculty, GroupItem, Group } from '../../../../model';
import { FacultyService } from '../../../../service';
import { AddFacultyGroupDialogComponent } from './add-faculty-group-dialog/add-faculty-group-dialog.component';

@Component({
  selector: 'app-edit-faculty',
  templateUrl: './edit-faculty.component.html',
  styleUrls: ['./edit-faculty.component.css']
})
export class EditFacultyComponent implements OnInit {

    private sub: any;
    private faculty: Faculty;

    generalFacultyFormGroup: FormGroup;

    facultyGroupsItems: GroupItem[] = [];

      /**
     * Notification message from received
     * form request or router
     */
    notification: DisplayMessage;

    facultyGroupsDisplayedColumns = ['id', 'name', 'membersNum'];
    facultyGroupsDS: MatTableDataSource<GroupItem> = new MatTableDataSource<GroupItem>([]);

    submitted = false;
    completed = false;
    removeGroup = false;

 
    constructor(
      private route: ActivatedRoute,
      private router: Router,
      private snackBar: MatSnackBar,
      private formBuilder: FormBuilder,
      private facultyService: FacultyService,
      private addFacultyGroupDialog: MatDialog,
      private confirmationDialog: MatDialog
    ) { }
  
    ngOnInit() {
        this.completed = false;
        this.generalFacultyFormGroup = this.formBuilder.group({
            title: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)])],
        });

        this.sub = this.route.params.subscribe(params => {
            this.facultyService.getById(params['id'])
            .delay(250)
            .subscribe(faculty => {
              this.setFaculty(faculty);
              this.completed = true;
              console.log(this.faculty);
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

    setFaculty(faculty: Faculty) {
        this.faculty = faculty;
        this.facultyGroupsItems = [];
        for (let facultyGroup of this.faculty.groups) {
          let facultyGroupItem: GroupItem = <GroupItem> facultyGroup;
          facultyGroupItem.checked = false;
          facultyGroupItem.membersNum = facultyGroupItem.members.length;
          this.facultyGroupsItems.push(facultyGroupItem);
        }
        this.facultyGroupsDS = new MatTableDataSource<GroupItem>(this.facultyGroupsItems);
        this.checkSelected();
    }

    onGeneralFacultyFormGroupSubmit() {
        this.submitted = true;

        this.facultyService.update(this.faculty)
        // show the animation
        .delay(250)
        .subscribe(faculty => {
            this.faculty =faculty;
            this.submitted = false;
            this.notification = { msgType: 'styles-success', msgBody: '<b>' + faculty.title + '</b>' + ' successfully updated' };
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
        this.removeGroup = false;
        for (let facultyGroupItem of this.facultyGroupsItems) {
          if (facultyGroupItem.checked) {
            this.removeGroup = true;
          }
        }
    }

    openAddGroupDialog() {
        let dialogRef = this.addFacultyGroupDialog.open(AddFacultyGroupDialogComponent, {
            width: '80%',
            data: this.faculty
          });
          dialogRef.afterClosed().subscribe(faculty => {
            if (faculty) {
              this.setFaculty(faculty);
            }
          });
    }

    removeSelectedGroup() {
        let dialogRef = this.confirmationDialog.open(ConfirmationDialog, {
            width: '80%',
            data: "Confirm please Faculty Groups deletion"
          });
          dialogRef.afterClosed().subscribe(confirmed => {
            if (confirmed) {
              let removeFacultyGroups:Group[] = [];
              for (let facultyGroupItem of this.facultyGroupsItems) {
                if (facultyGroupItem.checked) {
                  let removeFacultyGroup:Group = new Group().map(facultyGroupItem);
                  removeFacultyGroups.push(removeFacultyGroup);
                }
              }
              // console.log(this.groupMembersItems);
          
              this.submitted = true;
              this.facultyService.removeFacultyGroups(this.faculty.id, removeFacultyGroups)
              .delay(250)
              .subscribe(faculty => {
                this.setFaculty(faculty);
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

    facultyGroupClicked(selectedGroup: Group) {
        this.router.navigate(['group-edit', selectedGroup.id]);
    }

}