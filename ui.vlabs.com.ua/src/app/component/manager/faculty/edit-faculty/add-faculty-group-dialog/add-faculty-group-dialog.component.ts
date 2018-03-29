import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar,
  MatTableDataSource } from '@angular/material';
import { Faculty, Group, GroupItem } from '../../../../../model';
import { FacultyService } from '../../../../../service';

@Component({
  selector: 'add-faculty-group-dialog',
  templateUrl: './add-faculty-group-dialog.component.html',
  styleUrls: ['./add-faculty-group-dialog.component.css']
})
export class AddFacultyGroupDialogComponent implements OnInit {

  completed = false;
  submitted = false;
  enabled = false;

  notFacultyGroups: Group[] = [];
  nonFacultyGroupsItems: GroupItem[] = [];

  potentialFacultyGroupsDisplayedColumns = ['id', 'name', 'membersNum'];
  potentialFacultyGroupsDS: MatTableDataSource<GroupItem> = new MatTableDataSource<GroupItem>([]);

  constructor(
    public dialogRef: MatDialogRef<AddFacultyGroupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public faculty: Faculty,
    private facultyService: FacultyService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    console.log("Selected Faculty:", this.faculty);

    this.facultyService.getNonFacultyGroups(this.faculty.id)
    .delay(250)
    .subscribe(notFacultyGroups => {
      this.notFacultyGroups = notFacultyGroups;
      this.completed = true;
      console.log(this.notFacultyGroups);
      for (let notFacultyGroup of this.notFacultyGroups) {
        let notFacultyGroupItem: GroupItem = <GroupItem> notFacultyGroup;
        notFacultyGroupItem.checked = false;
        notFacultyGroupItem.membersNum = notFacultyGroup.members.length;
        this.nonFacultyGroupsItems.push(notFacultyGroupItem);
      }
      this.potentialFacultyGroupsDS = new MatTableDataSource<GroupItem>(this.nonFacultyGroupsItems);
    },
    error => {
      this.snackBar.open(error.json().message, 'SERVER ERROR', {
        panelClass: ['errorSnackBar'],
        duration: 1000,
        verticalPosition: 'top'
      });
    });
  }

  checkSelected() {
    this.enabled = false;
    for (let notFacultyGroupItem of this.nonFacultyGroupsItems) {
      if (notFacultyGroupItem.checked) {
        this.enabled = true;
      }
    }
  }

  addFacultyGroup() {
    let newFacultyGroups:Group[] = [];
    for (let notFacultyGroupItem of this.nonFacultyGroupsItems) {
      if (notFacultyGroupItem.checked) {
        let notFacultyGroup:Group = new Group().map(notFacultyGroupItem);
        newFacultyGroups.push(notFacultyGroup);
      }
    }
    // console.log(newFacultyGroups);

    this.submitted = true;
    this.facultyService.addFacultyGroups(this.faculty.id, newFacultyGroups)
    .delay(250)
    .subscribe(faculty => {
      this.dialogRef.close(faculty);
    },
    error => {
      this.snackBar.open(error.json().message, 'SERVER ERROR', {
        panelClass: ['errorSnackBar'],
        duration: 1000,
        verticalPosition: 'top'
      });
    });
  }

}
