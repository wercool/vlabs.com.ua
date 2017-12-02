import { Component, OnInit } from '@angular/core';
import { VlabService } from '../../../service/index';
import { Vlab } from '../../../model/index';
import { MatTableDataSource } from '@angular/material';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-vlabs-management',
  templateUrl: './vlabs-management.component.html',
  styleUrls: ['./vlabs-management.component.css']
})
export class VlabsManagementComponent implements OnInit {

  host = environment.host;

  vlabsAll: Vlab[] = [];
  vlabsNum: number = 0;

  vlabsDisplayedColumns = ['id', 'title', 'path'];
  vlabsDS: MatTableDataSource<Vlab>;

  constructor(
    private vlabService: VlabService
  ) { }

  ngOnInit() {
    this.getAllVlabs();
  }

  private getAllVlabs():void {
    this.vlabService.getAll()
    .subscribe(result => {
      this.vlabsAll = result;
      this.vlabsNum = this.vlabsAll.length;
      this.vlabsDS = new MatTableDataSource<Vlab>(this.vlabsAll);
    },
    error => {
    });
  }
}
