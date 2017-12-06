import { Component, OnInit, ViewChild } from '@angular/core';
import { EClass } from '../../../model/index';
import { MatTableDataSource, MatExpansionPanel } from '@angular/material';
import { EClassService } from '../../../service/index';
import { EditEclassComponent } from './edit-eclass/edit-eclass.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-eclass-management',
  templateUrl: './eclass-management.component.html',
  styleUrls: ['./eclass-management.component.css']
})
export class EclassManagementComponent implements OnInit {

  @ViewChild('eclassesListPanel') eclassesListPanel: MatExpansionPanel;

  eclassesAll: EClass[] = [];
  eclassesNum: number = 0;

  eclassesDisplayedColumns = ['id', 'title', 'description', 'active'];
  eclassesDS: MatTableDataSource<EClass>;

  constructor(
    private router: Router,
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
    this.eclassesAll.unshift(eclass);
    this.refreshDS();
    this.eclassesListPanel.open();
  }

  eclassRowClicked(selectedEClass: EClass){
    this.router.navigate(['eclass-edit', selectedEClass.id]);
  }
}
