import { Component, OnInit, Input } from '@angular/core';
import { CElement } from '../../../model/index';

@Component({
  selector: 'app-celement-item',
  templateUrl: './celement-item.component.html',
  styleUrls: ['./celement-item.component.css']
})
export class CElementItemComponent implements OnInit {

  @Input() cElement: CElement;

  constructor() { }

  ngOnInit() {

  }


}
