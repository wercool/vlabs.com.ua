import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DisplayMessage } from '../../../shared/models/display-message';
import { Partner } from '../../../model/index';
import { MatTableDataSource, MatExpansionPanel } from '@angular/material';
import { PartnerService } from '../../../service/index';

@Component({
  selector: 'app-partner-management',
  templateUrl: './partner-management.component.html',
  styleUrls: ['./partner-management.component.css']
})
export class PartnerManagementComponent implements OnInit {

  @ViewChild('partnersListPanel') partnersListPanel: MatExpansionPanel;

  partnersAll: Partner[] = [];
  partnersNum: number = 0;

  partnersDisplayedColumns = ['id', 'name'];
  partnersDS: MatTableDataSource<Partner>;

  constructor(
    private partnerService: PartnerService
  ) { }

  ngOnInit() {
    this.getAllPartners();
  }

  private getAllPartners():void {
    this.partnerService.getAll()
    .subscribe(result => {
      this.upateDS(result);
    },
    error => {
    });
  }

  private upateDS(updatedDS: Partner[]){
    this.partnersAll = updatedDS;
    this.refreshDS();
  }

  private refreshDS(){
    this.partnersNum = this.partnersAll.length;
    this.partnersDS = new MatTableDataSource<Partner>(this.partnersAll);
  }

  onNewPartnerAddedEvent(partner: Partner){
    this.partnersAll.push(partner);
    this.refreshDS();
    this.partnersListPanel.open();
  }

}
