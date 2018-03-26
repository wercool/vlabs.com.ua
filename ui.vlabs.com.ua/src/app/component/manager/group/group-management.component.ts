import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatExpansionPanel } from '@angular/material';
import { Group } from '../../../model/index';
import { GroupService } from '../../../service/index';
import { Router } from '@angular/router';

@Component({
  selector: 'app-group-management',
  templateUrl: './group-management.component.html',
  styleUrls: ['./group-management.component.css']
})
export class GroupManagementComponent implements OnInit {

  @ViewChild('groupsListPanel') groupsListPanel: MatExpansionPanel;

  groupsAll: Group[] = [];
  groupsNum: number = 0;

  groupsDisplayedColumns = ['id', 'name'];
  groupsDS: MatTableDataSource<Group>;

  constructor(
    private router: Router,
    private groupService: GroupService
  ) { }

  ngOnInit() {
    this.getAllGroups();
  }

  private getAllGroups():void {
    this.groupService.getAll()
    .subscribe(result => {
      this.upateDS(result);
    },
    error => {
    });
  }

  private upateDS(updatedDS: Group[]){
    this.groupsAll = updatedDS;
    this.refreshDS();
  }

  private refreshDS(){
    this.groupsNum = this.groupsAll.length;
    this.groupsDS = new MatTableDataSource<Group>(this.groupsAll);
  }

  groupRowClicked(selectedGroup: Group){
    this.router.navigate(['group-edit', selectedGroup.id]);
  }

  onNewGroupAddedEvent(group: Group){
    this.groupsAll.push(group);
    this.refreshDS();
    this.groupsListPanel.open();
  }

}
