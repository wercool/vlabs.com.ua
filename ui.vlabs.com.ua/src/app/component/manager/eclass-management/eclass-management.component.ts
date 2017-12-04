import { Component, OnInit, ViewChild } from '@angular/core';
import { EClass } from '../../../model/index';
import { MatTableDataSource, MatExpansionPanel } from '@angular/material';
import { EClassService } from '../../../service/index';

@Component({
  selector: 'app-eclass-management',
  templateUrl: './eclass-management.component.html',
  styleUrls: ['./eclass-management.component.css']
})
export class EclassManagementComponent implements OnInit {

  @ViewChild('eclassesListPanel') eclassesListPanel: MatExpansionPanel;

  eclassesAll: EClass[] = [];
  eclassesNum: number = 0;

  eclassesDisplayedColumns = ['id', 'title'];
  eclassesDS: MatTableDataSource<EClass>;

  constructor(
    private eclassService: EClassService
  ) { }

  ngOnInit() {
    this.getAllEClasses();
  }

  private getAllEClasses():void {
    this.eclassService.getAll()
    .subscribe(result => {
      this.upateDS(result);
    },
    error => {
    });
  }

  private upateDS(updatedDS: EClass[]){
    this.eclassesAll = updatedDS;
    this.refreshDS();
  }

  private refreshDS(){
    this.eclassesNum = this.eclassesAll.length;
    this.eclassesDS = new MatTableDataSource<EClass>(this.eclassesAll);
  }

  onNewEClassAddedEvent(eclass: EClass){
    this.eclassesAll.push(eclass);
    this.refreshDS();
    this.eclassesListPanel.open();
  }
}
