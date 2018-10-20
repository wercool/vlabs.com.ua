import { NgModule } from '@angular/core';

import { AuthenticatedGuard, HelpClipDeactivateGuard } from '../guard';

@NgModule({
  providers:
  [
    AuthenticatedGuard,
    HelpClipDeactivateGuard
  ],
  declarations: []
})
export class GuardModule { }
