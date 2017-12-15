import { Component, OnInit, Input } from '@angular/core';
import { CElement } from '../../../../model/index';

@Component({
  selector: 'celement-item-quiz',
  templateUrl: './celement-quiz.component.html',
  styleUrls: ['./celement-quiz.component.css']
})
export class CelementQuizComponent implements OnInit {

  @Input() cElement: CElement;

  constructor() { }

  ngOnInit() {
  }

}
