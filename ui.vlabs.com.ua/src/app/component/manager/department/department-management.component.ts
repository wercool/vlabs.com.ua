import { Component, OnInit, ViewChild } from '@angular/core';
import { Department } from '../../../model/index';
import { MatTableDataSource, MatExpansionPanel } from '@angular/material';
import { DepartmentService } from '../../../service/index';

@Component({
  selector: 'app-department-management',
  templateUrl: './department-management.component.html',
  styleUrls: ['./department-management.component.css']
})
export class DepartmentManagementComponent implements OnInit {

  @ViewChild('departmentsListPanel') departmentsListPanel: MatExpansionPanel;

  departmentsAll: Department[] = [];
  departmentsNum: number = 0;

  departmentsDisplayedColumns = ['id', 'title'];
  departmentsDS: MatTableDataSource<Department>;

  constructor(
    private departmentService: DepartmentService
  ) { }

  ngOnInit() {
    this.getAllDepartments();
  }

  private getAllDepartments():void {
    this.departmentService.getAll()
    .subscribe(result => {
      this.upateDS(result);
    },
    error => {
    });
  }

  private upateDS(updatedDS: Department[]){
    this.departmentsAll = updatedDS;
    this.refreshDS();
  }

  private refreshDS(){
    this.departmentsNum = this.departmentsAll.length;
    this.departmentsDS = new MatTableDataSource<Department>(this.departmentsAll);
  }

  onNewDepartmentAddedEvent(department: Department){
    this.departmentsAll.push(department);
    this.refreshDS();
    this.departmentsListPanel.open();
  }

}
