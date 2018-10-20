import { NgModule } from '@angular/core';

import { ApiService, AuthService, UserService, HelpClipService, ToolbarLabelService } from '../service';

@NgModule({
  providers:
  [
    ToolbarLabelService,
    ApiService,
    AuthService,
    UserService,
    HelpClipService
  ],
  declarations: []
})
export class ServiceModule { }
