import { Component, OnInit, ViewChild } from '@angular/core';
import { Module } from '../../model/index';
import { MatTableDataSource, MatExpansionPanel } from '@angular/material';
import { ModuleService } from '../../service/index';

@Component({
  selector: 'app-module-management',
  templateUrl: './module-management.component.html',
  styleUrls: ['./module-management.component.css']
})
export class ModuleManagementComponent implements OnInit {

  @ViewChild('modulesListPanel') modulesListPanel: MatExpansionPanel;

  modulesAll: Module[] = [];
  modulesNum: number = 0;

  modulesDisplayedColumns = ['id', 'title'];
  modulesDS: MatTableDataSource<Module>;

  constructor(
    private moduleService: ModuleService
  ) { }

  ngOnInit() {
    this.getAllModules();
  }

  private getAllModules():void {
    this.moduleService.getAll()
    .subscribe(result => {
      this.upateDS(result);
    },
    error => {
    });
  }

  private upateDS(updatedDS: Module[]){
    this.modulesAll = updatedDS;
    this.refreshDS();
  }

  private refreshDS(){
    this.modulesNum = this.modulesAll.length;
    this.modulesDS = new MatTableDataSource<Module>(this.modulesAll);
  }

  onNewModuleAddedEvent(module: Module){
    this.modulesAll.push(module);
    this.refreshDS();
    this.modulesListPanel.open();
  }
}
