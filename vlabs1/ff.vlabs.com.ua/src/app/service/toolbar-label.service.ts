import { Injectable, Output, EventEmitter } from '@angular/core';

@Injectable()
export class ToolbarLabelService {

  @Output() onToolbarLabelChanged = new EventEmitter<any>();

  label: string = 'Dashboard';

  constructor(
  ) { }

  setLabel(label: string) {
      this.label = label;
      this.onToolbarLabelChanged.emit(this.label);
  }

}
