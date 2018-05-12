import { NgModule } from '@angular/core';

import { AuthenticatedGuard } from '../guard';

@NgModule({
  providers:
  [
    AuthenticatedGuard,
  ],
  declarations: []
})
export class GuardModule { }
