import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable()
export class HelpClipDeactivateGuard implements CanDeactivate<CanComponentDeactivate> {

  canDeactivate(component: CanComponentDeactivate) {
    let can = component.canDeactivate();
    console.log('HelpClipDeactivateGuard#canDeactivate called, can: ', can);
    if (!can) {
      alert('HelpClipDeactivateGuard: navigation out is blocked');
      return false;
    }

    return true;
  }

}