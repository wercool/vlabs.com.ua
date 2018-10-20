import { Component, OnInit, ViewChild } from '@angular/core';
import { Faculty } from '../../../model/index';
import { MatTableDataSource, MatExpansionPanel } from '@angular/material';
import { FacultyService } from '../../../service/index';
import { Router } from '@angular/router';

@Component({
  selector: 'app-faculty-management',
  templateUrl: './faculty-management.component.html',
  styleUrls: ['./faculty-management.component.css']
})
export class FacultyManagementComponent implements OnInit {

  @ViewChild('facultiesListPanel') facultiesListPanel: MatExpansionPanel;

  facultiesAll: Faculty[] = [];
  facultiesNum: number = 0;

  facultiesDisplayedColumns = ['id', 'title'];
  facultiesDS: MatTableDataSource<Faculty>;

  constructor(
    private facultyService: FacultyService,
    private router: Router
  ) { }

  ngOnInit() {
    this.getAllFaculties();
  }

  private getAllFaculties():void {
    this.facultyService.getAll()
    .subscribe(result => {
      this.upateDS(result);
    },
    error => {
    });
  }

  private upateDS(updatedDS: Faculty[]){
    this.facultiesAll = updatedDS;
    this.refreshDS();
  }

  private refreshDS(){
    this.facultiesNum = this.facultiesAll.length;
    this.facultiesDS = new MatTableDataSource<Faculty>(this.facultiesAll);
  }

  onNewFacultyAddedEvent(faculty: Faculty){
    this.facultiesAll.push(faculty);
    this.refreshDS();
    this.facultiesListPanel.open();
  }

  facultyRowClicked(selectedFaculty: Faculty){
    this.router.navigate(['faculty-edit', selectedFaculty.id]);
  }
}
